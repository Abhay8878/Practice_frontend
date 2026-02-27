import { X } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { teeth, teethFDI } from "./toothPaths";
import Raphael, {
  RaphaelPaper,
  RaphaelSet,
  RaphaelElement,
} from "raphael";


interface LabelProps {
  text: string;
  x: number;
  y: number;
  fontSize?: number;
  fontWeight?: string;
  color?: string;
}

interface ColorProps {
  defaultFill: string;
  selectedFill: string;
  hoverFill: string;
  textDefault: string;
  textSelected: string;
  textSelectionbg?: string;
}

interface ArchSelectorProps {
  labels: LabelProps[];
  toothSelection?: string[][] | undefined;
  colors: ColorProps;
  UTNSwitchFDI?: boolean;
  onSelectionChange?: (selected: string[][]) => void;
}

// type ToothData = {
//   toothSet: any;
//   toothText: any;
//   archPosition: "upper" | "lower";
//   label: string; 
//   pathElements: any[];
//   textCircle: any;
// };

type ToothData = {
  toothSet: RaphaelSet;
  toothText: RaphaelElement;
  archPosition: "upper" | "lower";
  label: string;
  pathElements: RaphaelElement[];
  textCircle: RaphaelElement | null;
};


type SvgCoords = { x: number; y: number };

const TeethSelector = ({
  labels,
  colors,
  UTNSwitchFDI,
  onSelectionChange,
  toothSelection,
}: ArchSelectorProps) => {
  const [selectedGroups, setSelectedGroups] = useState<string[][]>(
    toothSelection ?? [],
  );
  const [hoveredGroup, setHoveredGroup] = useState<string[] | null>(null);
  const [deleteIconPosition, setDeleteIconPosition] =
    useState<SvgCoords | null>(null);

  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // const paperRef = useRef<any>(null);
  const paperRef = useRef<RaphaelPaper | null>(null);

  const teethDataMapRef = useRef<Map<string, ToothData>>(new Map());
  const toothToGroupMapRef = useRef<Map<string, string[]>>(new Map());
  const flattenedSelectionRef = useRef<Set<string>>(new Set());

  const currentTeethData = useMemo(
    () => (UTNSwitchFDI ? teeth : teethFDI),
    [UTNSwitchFDI],
  );

  // Sync external selection changes using useLayoutEffect to avoid cascading renders
  useLayoutEffect(() => {
    if (
      toothSelection &&
      JSON.stringify(toothSelection) !== JSON.stringify(selectedGroups)
    ) {
      setSelectedGroups(toothSelection);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toothSelection]);

  const flattenSelections = useCallback((groups: string[][]): Set<string> => {
    const result = new Set<string>();
    for (const group of groups) {
      for (const tooth of group) {
        result.add(tooth);
      }
    }
    return result;
  }, []);

  // Update maps when selection changes
  useEffect(() => {
    flattenedSelectionRef.current = flattenSelections(selectedGroups);
    toothToGroupMapRef.current.clear();
    selectedGroups?.forEach((group) => {
      group?.forEach((tooth) => {
        toothToGroupMapRef.current.set(tooth, group);
      });
    });
  }, [selectedGroups, flattenSelections]);

  // Handle delete group
  const handleDeleteGroup = useCallback(
    (groupToDelete: string[]) => {
      const groupToDeleteJSON = JSON.stringify(groupToDelete);
      const newGroups = selectedGroups.filter(
        (group) => JSON.stringify(group) !== groupToDeleteJSON,
      );

      setSelectedGroups(newGroups);
      onSelectionChange?.(newGroups);
      setHoveredGroup(null);
      setDeleteIconPosition(null);
    },
    [selectedGroups, onSelectionChange],
  );

  function getToothFill(label: string, tempFill?: string) {
    const isSelected = flattenedSelectionRef.current.has(label);

    if (isSelected) {
      return colors.selectedFill;
    }
    return tempFill || colors.defaultFill;
  }

  useEffect(() => {
    const container = document.getElementById("canvas_container") ;
    if (!container) return;

    paperRef.current?.remove();
    const paper = new Raphael(container, 300, 400);
    paperRef.current = paper;

    let isDragging = false;
    let startArch: "upper" | "lower" | null = null;
    const draggedTeeth = new Set<string>();

    const teethDataMap = teethDataMapRef.current;
    teethDataMap.clear();

    container.addEventListener("mouseleave", () => {
      setHoveredGroup(null);
      setDeleteIconPosition(null);

      // Reset tooth colors
      teethDataMap.forEach((tData) => {
        const isSelected = flattenedSelectionRef.current.has(tData.label);
        tData.pathElements.forEach((p) =>
          p.attr({
            fill: getToothFill(tData.label),
          }),
        );
        tData.toothText.attr({
          fill: isSelected ? colors.textSelected : colors.textDefault,
        });

        if (tData.textCircle && !isSelected) {
          tData.textCircle.remove();
          tData.textCircle = null;
        }
      });

      isDragging = false;
      draggedTeeth.clear();
    });

    container.addEventListener("mouseenter", () => {
      setHoveredGroup(null);
      setDeleteIconPosition(null);
    });

    function calculateDeleteIconPosition(
      group: string[],
      arch: "upper" | "lower",
    ): SvgCoords | null {
      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;

      group.forEach((lbl) => {
        const tData = teethDataMap.get(lbl);
        if (tData) {
          const bbox = tData.toothSet.getBBox();
          minX = Math.min(minX, bbox.x);
          minY = Math.min(minY, bbox.y);
          maxX = Math.max(maxX, bbox.x + bbox.width);
          maxY = Math.max(maxY, bbox.y + bbox.height);
        }
      });

      if (minX === Infinity) return null;

      const svgCenterX = (minX + maxX) / 2;
      const svgCenterY = (minY + maxY) / 2;
      const side =
        svgCenterX < 130 ? "left" : svgCenterX > 170 ? "right" : "center";

      let svgX = svgCenterX;
      let svgY = svgCenterY;

      if (arch === "upper") {
        if (side === "left") {
          svgX = minX - 10;
          svgY = svgCenterY - 5;
        } else if (side === "right") {
          svgX = maxX + 10;
          svgY = svgCenterY - 5;
        } else {
          svgX = svgCenterX;
          svgY = minY - 20;
        }
      } else {
        if (side === "left") {
          svgX = minX - 5;
          svgY = svgCenterY + 5;
        } else if (side === "right") {
          svgX = maxX + 15;
          svgY = svgCenterY + 12;
        } else {
          svgX = svgCenterX;
          svgY = maxY + 15;
        }
      }

      const containerRect = container.getBoundingClientRect();
      if (containerRect.width > 0 && containerRect.height > 0) {
        return {
          x: (svgX / 300) * containerRect.width,
          y: (svgY / 400) * containerRect.height,
        };
      }
      return null;
    }

    function createTooth(
      paths: string[],
      textX: number,
      textY: number,
      label: string,
    ): ToothData {
      const toothSet = paper.set();
      const archPosition = (textY < 190 ? "upper" : "lower") as
        | "upper"
        | "lower";
      // const pathElements: any[] = [];
      const pathElements: RaphaelElement[] = [];


      const isInitiallySelected = flattenedSelectionRef.current.has(label);

      // Create tooth paths
      paths.forEach((p, index) => {
        const el = paper.path(p);
        el.attr({
          fill: getToothFill(label),
          stroke: "#CCCCCC",
        });

        if (index === 0) {
          el.node.setAttribute(
            "data-automation-id",
            `toothselection-toothnumber.${label}`,
          );
        }

        toothSet.push(el);
        pathElements.push(el);
      });

      // Create circle behind text if selected
     let textCircle: RaphaelElement | null = null;
      if (isInitiallySelected) {
        const bbox = paper.text(textX, textY, label).getBBox();
        const padding = 4;
        const radius = Math.max(bbox.width, bbox.height) / 2 + padding;

        textCircle = paper.circle(textX, textY, radius).attr({
          fill: colors.textSelectionbg,
          stroke: colors.textSelected,
          "stroke-width": 1,
        });

        textCircle.toBack();
        toothSet.push(textCircle);
      }

      // Create text
      const toothText = paper.text(textX, textY, label).attr({
        fill: isInitiallySelected ? colors.textSelected : colors.textDefault,
      });
      (toothText.node as SVGTextElement).style.userSelect = "none";

      toothSet.push(toothText);

      const toothData: ToothData = {
        toothSet,
        toothText,
        archPosition,
        label,
        pathElements,
        textCircle,
      };

      teethDataMap.set(label, toothData);

      // Click to toggle selection
      function toggleToothSelection() {
        const wasSelected = flattenedSelectionRef.current.has(label);
        const nowSelected = !wasSelected;

        if (nowSelected) {
          flattenedSelectionRef.current.add(label);
        } else {
          flattenedSelectionRef.current.delete(label);
        }

        let updatedSelection: string[][];
        if (nowSelected) {
          updatedSelection = [...selectedGroups, [label]];
        } else {
          updatedSelection = selectedGroups.filter((t) => t[0] !== label);
        }

        onSelectionChange?.(updatedSelection);

        // Update path fill
        pathElements.forEach((p) =>
          p.animate({ fill: getToothFill(label) }, 200),
        );

        // Update text color
        toothText.attr({
          fill: nowSelected ? colors.textSelected : colors.textDefault,
        });

        // Update text circle
        if (nowSelected) {
          const bbox = toothText.getBBox();
          const padding = 4;
          const radius = Math.max(bbox.width, bbox.height) / 2 + padding;

          const newCircle = paper.circle(textX, textY, radius).attr({
            fill: colors.textSelectionbg,
            stroke: colors.textSelected,
            "stroke-width": 1,
          });

          newCircle.toBack();
          toothData.textCircle = newCircle;
        } else {
          toothData.textCircle?.remove();
          toothData.textCircle = null;
        }
      }

      toothSet.click(toggleToothSelection);
      toothText.click(toggleToothSelection);

      // Hover effects
      toothSet.hover(
        () => {
          if (isDragging) return;

          const isSelected = flattenedSelectionRef.current.has(label);

          if (isSelected) {
            return;
          } else {
            pathElements.forEach((p) =>
              p.animate({ fill: colors.hoverFill }, 200, "linear"),
            );
          }
        },
        () => {
          if (isDragging) return;

          const isSelected = flattenedSelectionRef.current.has(label);
          if (isSelected) return; 

          pathElements.forEach((p) =>
            p.animate({ fill: getToothFill(label) }, 200),
          );
        }
        ,
      );

      return toothData;
    }

    function getMouseSVGCoords(e: MouseEvent): SvgCoords {
      if (!container) return { x: 0, y: 0 };
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return { x: 0, y: 0 };
      return {
        x: ((e.clientX - rect.left) / rect.width) * 300,
        y: ((e.clientY - rect.top) / rect.height) * 400,
      };
    }

    function teethUnderMouse(mouse: SvgCoords): ToothData[] {
      const results: ToothData[] = [];
      for (const t of teethDataArray) {
        if (startArch && t.archPosition !== startArch) continue;
        for (const p of t.pathElements) {
          const bbox = p.getBBox();
          if (
            mouse.x >= bbox.x &&
            mouse.x <= bbox.x + bbox.width &&
            mouse.y >= bbox.y &&
            mouse.y <= bbox.y + bbox.height
          ) {
            results.push(t);
            break;
          }
        }
      }
      return results;
    }

    let isMoved = false;

    const handleMouseDown = (e: MouseEvent) => {
      let targetEl = e.target as HTMLElement;
      while (targetEl) {
        if (targetEl.id === "delete-group-container") return;
        targetEl = targetEl.parentElement as HTMLElement;
      }

      isDragging = true;
      isMoved = false;
      draggedTeeth.clear();
      container.style.userSelect = "none";

      const mouse = getMouseSVGCoords(e);
      const teethHit = teethUnderMouse(mouse);

      if (teethHit.length) {
        const hitLabel = teethHit[0].label;

        // If clicking on already selected tooth, let Click handler handle deselect (unless dragging starts later)
        // But for consistency, we start drag tracking.
        // The original logic returned early if already selected. 
        // We should allow drag to continue even if started on selected? 
        // No, current logic prevents new selection if starting on selected.
        // We'll keep it but ensure isDragging is set correctly.

        if (flattenedSelectionRef.current.has(hitLabel)) {
          // If we return here, drag logic stops. Click handler works. 
          // But isDragging might be true? logic below sets isDragging=false if we return?
          // Original code:
          // if (flattenedSelectionRef.current.has(hitLabel)) { isDragging = false; return; }
          // We keep this behavior for now.
        }

        if (flattenedSelectionRef.current.has(hitLabel)) {
          isDragging = false;
          return;
        }

        startArch = teethHit[0].archPosition;
        draggedTeeth.add(hitLabel);
      }

      e.preventDefault();
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      isMoved = true; // Mark as moved
      setDeleteIconPosition(null);
      setHoveredGroup(null);

      const mouse = getMouseSVGCoords(e);
      // ... rest of logic

      const teethHit = teethUnderMouse(mouse);
      if (!teethHit.length) return;

      const currentLabel = teethHit[0].label;
      draggedTeeth.add(currentLabel);

      const numbers = Array.from(draggedTeeth)
        .map((l) => parseInt(l, 10))
        .filter((n) => !isNaN(n));

      if (numbers.length > 0) {
        const minNum = Math.min(...numbers);
        const maxNum = Math.max(...numbers);

        for (const t of currentTeethData) {
          const tData = teethDataMap.get(t.label);
          if (tData && tData.archPosition === startArch) {
            const n = parseInt(t.label, 10);
            if (!isNaN(n) && n >= minNum && n <= maxNum) {
              draggedTeeth.add(t.label);
              tData.pathElements.forEach((p) =>
                p.animate(
                  { fill: getToothFill(t.label, colors.hoverFill) },
                  20,
                  "linear",
                ),
              );
              tData.toothText.toFront();
            }
          }
        }
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!isDragging) return;
      if (!isMoved) {
        // Handle explicit click logic here instead of relying on propagation
        const mouse = getMouseSVGCoords(e);
        const teethHit = teethUnderMouse(mouse);
        if (teethHit.length > 0) {
          const label = teethHit[0].label;
          // Toggle logic manually
          if (flattenedSelectionRef.current.has(label)) {
            handleDeleteGroup(toothToGroupMapRef.current.get(label) || [label]);
          } else {
            // Add single tooth
            const newGroups = [...selectedGroups, [label]];
            setSelectedGroups(newGroups);
            onSelectionChange?.(newGroups);
          }
        }

        isDragging = false;
        container.style.userSelect = "auto";
        return;
      }

      const draggedArray = Array.from(draggedTeeth);
      const hasOverlap = draggedArray.some((label) =>
        flattenedSelectionRef.current.has(label),
      );

      const newGroups: string[][] = [...selectedGroups];

      if (!hasOverlap) {
        if (draggedTeeth.size === 1) {
          const singleToothLabel = draggedArray[0];
          newGroups.push([singleToothLabel]);
        } else if (draggedTeeth.size > 0) {
          const draggedNumbers = draggedArray
            .map((l) => parseInt(l, 10))
            .filter((n) => !isNaN(n));

          if (draggedNumbers.length > 0) {
            const minNum = Math.min(...draggedNumbers);
            const maxNum = Math.max(...draggedNumbers);

            const allLabelsInRange = currentTeethData
              .filter((t) => {
                const tData = teethDataMap.get(t.label);
                if (!tData || tData.archPosition !== startArch) return false;
                const n = parseInt(t.label, 10);
                return !isNaN(n) && n >= minNum && n <= maxNum;
              })
              .map((t) => t.label);

            if (allLabelsInRange.length > 0) {
              newGroups.push(allLabelsInRange);
            }
          }
        }
      }

      setSelectedGroups(newGroups);
      onSelectionChange?.(newGroups);

      const newFlattenedSelection = flattenSelections(newGroups);
      for (const t of teethDataArray) {
        const isSelected = newFlattenedSelection.has(t.label);
        t.pathElements.forEach((p) => p.attr({ fill: getToothFill(t.label) }));
        t.toothText.attr({
          fill: isSelected ? colors.textSelected : colors.textDefault,
        });
      }

      isDragging = false;
      startArch = null;
      draggedTeeth.clear();
      container.style.userSelect = "auto";
    };

    container.addEventListener("mousedown", handleMouseDown);
    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseup", handleMouseUp);

    // Draw arches
    const upperArch = paper.path("M70,180 Q145,-80 220,180");
    upperArch.attr({ fill: "#F5F5F5", stroke: "#fff" });
    const lowerArch = paper.path("M70,200 Q145,440 220,200");
    lowerArch.attr({ fill: "#F5F5F5", stroke: "#fff" });

    // Draw labels
    labels.forEach(
      ({ text, x, y, fontSize = 16, fontWeight = "bold", color = "#000" }) => {
        const lbl = paper.text(x, y, text);
        lbl.attr({
          "font-size": fontSize,
          "font-weight": fontWeight,
          fill: color,
        });
        (lbl.node as SVGTextElement).style.userSelect = "none";
      },
    );

    const teethDataArray = currentTeethData.map((t) =>
      createTooth(t.paths, t.textX, t.textY, t.label),
    );

    return () => {
      container.removeEventListener("mousedown", handleMouseDown);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseup", handleMouseUp);

      paper.remove();
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, [
    UTNSwitchFDI,
    colors,
    labels,
    currentTeethData,
    flattenSelections,
    onSelectionChange,
    selectedGroups,
    handleDeleteGroup,
  ]);

  return (
    <div style={{ position: "relative", width: "300px", height: "400px" }}>
      <div id="canvas_container" style={{ width: "300px", height: "400px" }} />

      {/* Floating Delete Badge */}
      {deleteIconPosition && hoveredGroup && (
        <div
          id="delete-group-container"
          className="group"
          style={{
            position: "absolute",
            left: `${deleteIconPosition.x}px`,
            top: `${deleteIconPosition.y}px`,
            transform: "translate(-50%, -50%)",
            zIndex: 1000,
          }}
          onMouseEnter={() => {
            if (hoverTimeoutRef.current) {
              clearTimeout(hoverTimeoutRef.current);
              hoverTimeoutRef.current = null;
            }
          }}
          onMouseLeave={() => {
            setDeleteIconPosition(null);
            setHoveredGroup(null);
          }}
        >
          <button
            onClick={() => handleDeleteGroup(hoveredGroup)}
            className="group size-6 rounded-full bg-black border-2 border-white flex items-center justify-center cursor-pointer shadow-lg transition-all duration-200 transform hover:scale-110 active:scale-95"
          >
            <span className="absolute text-white text-xs font-bold transition-opacity duration-200 group-hover:opacity-0">
              {hoveredGroup.length}
            </span>

            <span className="absolute text-white transition-opacity duration-200 opacity-0 group-hover:opacity-100">
              <X size={14} strokeWidth={3} />
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default TeethSelector;

