import { LoaderIcon } from "lucide-react";
import React, { useEffect, useRef, useState, useMemo } from "react";
// import "@kitware/vtk.js/favicon";
import "@kitware/vtk.js/Rendering/Profiles/Geometry";
import vtkActor from "@kitware/vtk.js/Rendering/Core/Actor";
import vtkFullScreenRenderWindow from "@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow";
import vtkMapper from "@kitware/vtk.js/Rendering/Core/Mapper";
import vtkSTLReader from "@kitware/vtk.js/IO/Geometry/STLReader";
import vtkPLYReader from "@kitware/vtk.js/IO/Geometry/PLYReader";
import vtkPolyDataNormals from "@kitware/vtk.js/Filters/Core/PolyDataNormals";
import { debounce, throttle } from "lodash";

// Simple LRU Cache implementation
class LRUCache<K, V> {
  private maxSize: number;
  private cache: Map<K, V>;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value) {
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: K, value: V) {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }
}

interface ThreeDimensionalViewerProps {
  pathToFile: string | { url?: string; s3_url?: string };
  fileType?: "stl" | "ply";
  width?: number | string;
  height?: number | string;
  fillContainer?: boolean;
  backgroundColor?: number;
  modelColor?: number;
  opacity?: number;
  specular?: number;
  onClick?: () => void;
  duplicatePointsForFaceTexture?: boolean;
  optimizeParsing?: boolean;
  loaderSize?: string;
}

const ThreeDimensionalViewer: React.FC<ThreeDimensionalViewerProps> =
  React.memo(
    ({
      pathToFile, 
      fileType = "stl",
      width,
      height,
      fillContainer = true,
      backgroundColor = 0xcecbcb,
      modelColor = fileType === "ply" ? 0xc8c8c8 : 0x999999,
      opacity = 1.0,
      specular = 0,
      onClick,
      duplicatePointsForFaceTexture = false,
      optimizeParsing = true,
      loaderSize = "size-10",
    }) => {
      const mountRef = useRef<HTMLDivElement | null>(null);
      const [isLoading, setIsLoading] = useState(true);
      const [progress, setProgress] = useState(0);
      const rendererRef = useRef<any>(null);
      const renderWindowRef = useRef<any>(null);
      const actorRef = useRef<any>(null);
      const interactorRef = useRef<any>(null);
      const pipelineRef = useRef<{
        reader?: any;
        normals?: any;
        mapper?: any;
        actor?: any;
        fullScreenRenderer?: any;
      }>({});
      const cacheRef = useRef<LRUCache<string, any>>(new LRUCache(10));
      const isDragging = useRef(false);
      const mouseDownPosition = useRef({ x: 0, y: 0 });
      const renderRequested = useRef(false);

      const handleResize = useMemo(
        () =>
          debounce(() => {
            if (
              mountRef.current &&
              rendererRef.current &&
              renderWindowRef.current &&
              interactorRef.current &&
              pipelineRef.current.reader &&
              pipelineRef.current.reader.getOutputData()
            ) {
              const { clientWidth, clientHeight } = mountRef.current;
              const containerWidth = fillContainer ? clientWidth : (typeof width === 'number' ? width : clientWidth);
              const containerHeight = fillContainer ? clientHeight : (typeof height === 'number' ? height : clientHeight);
              mountRef.current.style.width = `${containerWidth}px`;
              mountRef.current.style.height = `${containerHeight}px`;
              rendererRef.current.resetCamera();
              renderWindowRef.current.render();
            }
          }, 100),
        [width, height, fillContainer],
      );

      const handleMouseDown = (event: React.MouseEvent) => {
        if (
          !mountRef.current ||
          !rendererRef.current ||
          !renderWindowRef.current ||
          !interactorRef.current
        )
          return;
        mouseDownPosition.current = { x: event.clientX, y: event.clientY };
        isDragging.current = false;
      };

      const handleMouseMove = useMemo(
        () =>
          throttle((event: React.MouseEvent) => {
            if (
              !mountRef.current ||
              !rendererRef.current ||
              !renderWindowRef.current ||
              !interactorRef.current
            )
              return;
            const dx = Math.abs(event.clientX - mouseDownPosition.current.x);
            const dy = Math.abs(event.clientY - mouseDownPosition.current.y);
            if (dx > 5 || dy > 5) {
              isDragging.current = true;
            }
          }, 50),
        [],
      );

      const handleMouseUp = (event: React.MouseEvent) => {
        if (!isDragging.current && onClick) {
          onClick();
        }
        isDragging.current = false;
      };

      const url = useMemo(
        () =>
          typeof pathToFile === "string"
            ? pathToFile
            : pathToFile?.s3_url || pathToFile?.url,
        [pathToFile],
      );

      useEffect(() => {
        if (!mountRef.current || !url) {
          console.warn("mountRef.current or url is missing");
          setIsLoading(false);
          return;
        }

        let isMounted = true;
        let initialRenderDone = false;

        const initializeVTK = async () => {
          let { reader, normals, mapper, actor, fullScreenRenderer } =
            pipelineRef.current;

          // Get container dimensions
          const containerWidth = mountRef.current?.clientWidth || 400;
          const containerHeight = mountRef.current?.clientHeight || 400;
          const actualWidth = fillContainer ? containerWidth : (typeof width === 'number' ? width : containerWidth);
          const actualHeight = fillContainer ? containerHeight : (typeof height === 'number' ? height : containerHeight);

          if (!fullScreenRenderer) {
            fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
              container: mountRef.current,
              background: [
                ((backgroundColor >> 16) & 255) / 255,
                ((backgroundColor >> 8) & 255) / 255,
                (backgroundColor & 255) / 255,
              ],
              size: [actualWidth, actualHeight],
              preserveDrawingBuffer: false,
            });
            rendererRef.current = fullScreenRenderer.getRenderer();
            renderWindowRef.current = fullScreenRenderer.getRenderWindow();
            interactorRef.current = renderWindowRef.current.getInteractor();
            pipelineRef.current.fullScreenRenderer = fullScreenRenderer;
            interactorRef.current.cancelAnimation(fullScreenRenderer);
          }

          if (!actor) {
            actor = vtkActor.newInstance();
            mapper = vtkMapper.newInstance({
              scalarVisibility: fileType === "ply",
            });
            actorRef.current = actor;
            pipelineRef.current.actor = actor;
            pipelineRef.current.mapper = mapper;
          }

          const useNormals = fileType === "stl";
          if (fileType === "stl" && !reader) {
            reader = vtkSTLReader.newInstance();
            if (!optimizeParsing) {
              reader.setRemoveDuplicateVertices(5);
            }
            pipelineRef.current.reader = reader;
            if (useNormals) {
              normals = vtkPolyDataNormals.newInstance({
                computePointNormals: true,
                computeCellNormals: false, // Optimize by skipping cell normals
              });
              normals.setInputConnection(reader.getOutputPort());
              mapper.setInputConnection(normals.getOutputPort());
              pipelineRef.current.normals = normals;
            } else {
              mapper.setInputConnection(reader.getOutputPort());
            }
          } else if (fileType === "ply" && !reader) {
            reader = vtkPLYReader.newInstance({
              duplicatePointsForFaceTexture,
            });
            mapper.setInputConnection(reader.getOutputPort());
            pipelineRef.current.reader = reader;
          }

          actor.setMapper(mapper);
          rendererRef.current.addActor(actor);
        };

        const render = () => {
          if (
            !isMounted ||
            !renderWindowRef.current ||
            renderRequested.current ||
            !interactorRef.current
          )
            return;
          const { reader } = pipelineRef.current;
          if (reader && reader.getOutputData()) {
            renderRequested.current = true;
            requestAnimationFrame(() => {
              if (isMounted && renderWindowRef.current) {
                renderWindowRef.current.render();
                renderRequested.current = false;
                if (!initialRenderDone) {
                  initialRenderDone = true;
                  setIsLoading(false);
                  setProgress(0);
                }
              }
            });
          }
        };

        const update = () => {
          if (!isMounted || !actorRef.current || !interactorRef.current) return;
          const { reader, normals } = pipelineRef.current;
          if (!reader || !reader.getOutputData()) return;
          const property = actorRef.current.getProperty();
          if (!property) {
            console.error("Actor property is undefined.");
            return;
          }
          property.setColor(
            ((modelColor >> 16) & 255) / 255,
            ((modelColor >> 8) & 255) / 255,
            (modelColor & 255) / 255,
          );
          if (fileType === "ply") {
            property.setOpacity(opacity);
            property.setSpecular(specular);
            property.setSpecularPower(10);
            actorRef.current.getMapper().setScalarVisibility(true);
          }
          if (!initialRenderDone) {
            rendererRef.current.resetCamera();
          }
          render();
        };

        const loadModel = async () => {
          const { reader, normals } = pipelineRef.current;
          if (cacheRef.current.has(url)) {
            const cachedData = cacheRef.current.get(url);
            if (cachedData) {
              reader.setInputData(cachedData);
              if (fileType === "stl" && normals) {
                reader.update();
                normals.update();
              }
              update();
            } else {
              setIsLoading(false);
              setProgress(0);
            }
          } else {
            try {
              // Simulate progress for main-thread parsing
              const simulateProgress = () => {
                let fakeProgress = 0;
                const interval = setInterval(() => {
                  if (fakeProgress >= 90) {
                    clearInterval(interval);
                    return;
                  }
                  fakeProgress += 10;
                  if (isMounted) setProgress(fakeProgress);
                }, 100);
                return interval;
              };
              const progressInterval = simulateProgress();
              await reader.setUrl(url);
              clearInterval(progressInterval);
              if (!isMounted) return;
              if (fileType === "stl" && normals) {
                reader.update();
                normals.update();
              }
              cacheRef.current.set(url, reader.getOutputData());
              if (isMounted) setProgress(100);
              update();
            } catch (error) {
              if (!isMounted) return;
              console.error(
                `Error loading ${fileType.toUpperCase()} file:`,
                error,
              );
              setIsLoading(false);
              setProgress(0);
            }
          }
        };

        initializeVTK().then(loadModel);

        window.addEventListener("resize", handleResize);

        return () => {
          isMounted = false;
          handleResize.cancel();
          handleMouseMove.cancel();
          if (interactorRef.current && interactorRef.current.getContainer()) {
            interactorRef.current.cancelAnimation(
              pipelineRef.current.fullScreenRenderer,
            );
            interactorRef.current.setContainer(null);
          }
          window.removeEventListener("resize", handleResize);
          const { fullScreenRenderer, reader, normals, mapper, actor } =
            pipelineRef.current;
          if (fullScreenRenderer && rendererRef.current && actorRef.current) {
            rendererRef.current.removeActor(actorRef.current);
            fullScreenRenderer.delete();
          }
          if (reader) reader.delete();
          if (normals) normals.delete();
          if (mapper) mapper.delete();
          if (actor) actor.delete();
          pipelineRef.current = {};
          rendererRef.current = null;
          renderWindowRef.current = null;
          actorRef.current = null;
          interactorRef.current = null;
        };
      }, [
        url,
        fileType,
        duplicatePointsForFaceTexture,
        backgroundColor,
        modelColor,
        opacity,
        specular,
        width,
        height,
        optimizeParsing,
      ]);

      return (
        <div
          style={{
            width: fillContainer ? '100%' : (width ?? '100%'),
            height: fillContainer ? '100%' : (height ?? '100%'),
          }}
          className="relative overflow-hidden rounded-lg"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <div ref={mountRef} className="w-full h-full" />
          {isLoading && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                padding: "20px",
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                textAlign: "center",
              }}
            >
              <LoaderIcon className={`animate-spin ${loaderSize}`} />
              {/* {progress > 0 && <div>Loading: {progress}%</div>} */}
            </div>
          )}
        </div>
      );
    },
  );

export default ThreeDimensionalViewer;
