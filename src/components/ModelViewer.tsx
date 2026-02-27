import React, { Suspense, useState, useEffect } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, Stage, Html, Center, useProgress } from "@react-three/drei";
import { STLLoader } from "three-stdlib";
import { OBJLoader } from "three-stdlib";
import { GLTFLoader } from "three-stdlib";
import * as THREE from "three";

function Loader() {
    const { progress } = useProgress();
    return <Html center>{progress.toFixed(1)} % loaded</Html>;
}

interface ModelProps {
    url: string;
    extension: string;
}

const Model = ({ url, extension }: ModelProps) => {
    let LoaderClass: any;

    // Determine loader based on extension
    const ext = extension.toLowerCase().replace(".", "");

    if (ext === "stl") {
        LoaderClass = STLLoader;
    } else if (ext === "obj") {
        LoaderClass = OBJLoader;
    } else if (ext === "gltf" || ext === "glb") {
        LoaderClass = GLTFLoader;
    } else {
        // Fallback or error
        return <Html center>Unsupported file format: {extension}</Html>;
    }

    // Load the model
    const result = useLoader(LoaderClass, url);

    // Handle different result types (BufferGeometry for STL, Group for OBJ/GLTF)
    if (ext === "stl") {
        return (
            <mesh geometry={result as THREE.BufferGeometry}>
                <meshStandardMaterial color="gray" />
            </mesh>
        );
    } else if (ext === "obj") {
        return <primitive object={result} />;
    } else if (ext === "gltf" || ext === "glb") {
        // @ts-ignore
        return <primitive object={result.scene} />;
    }

    return null;
};

interface ModelViewerProps {
    url: string;
    fileName: string;
}

const ModelViewer: React.FC<ModelViewerProps> = ({ url, fileName }) => {
    const [extension, setExtension] = useState<string>("");

    useEffect(() => {
        if (fileName) {
            const ext = fileName.split(".").pop();
            if (ext) setExtension(ext);
        }
    }, [fileName]);

    if (!url || !extension) return null;

    return (
        <div className="w-full h-[400px] bg-gray-50 rounded-lg overflow-hidden border border-gray-200 relative">
            <Canvas shadows camera={{ position: [0, 0, 150], fov: 50 }}>
                <Suspense fallback={<Loader />}>
                    <Stage environment="city" intensity={0.6} adjustCamera={1.2}>
                        <Center>
                            <Model url={url} extension={extension} />
                        </Center>
                    </Stage>
                </Suspense>
                <OrbitControls makeDefault autoRotate autoRotateSpeed={2.5} />
            </Canvas>
            <div className="absolute bottom-2 right-2 text-xs text-gray-400 pointer-events-none">
                {fileName}
            </div>
        </div>
    );
};

export default ModelViewer;
