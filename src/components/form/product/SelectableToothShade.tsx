// // // import { Input } from "@/common-ui-components/src/shadcn"
// // import { useState } from "react";

// // import { cn } from "../../../lib/utils";

// // const OTHER_VALUE = "__other__";

// // export function SelectableToothGrid({
// //   options,
// //   value,
// //   disabledOptions = [],
// //   onChange,
// //   isCompleted = false,
// // }: any) {
// //   const [isOtherShow, setIsOtherShow] = useState(false);

// //   //   const isValueInOptions = options.some(
// //   //     (item: any) => item.value === value
// //   //   )

// //   const isOtherActive = isOtherShow || value === OTHER_VALUE;

// //   const selectedOption = options.find((item: any) => item.value === value);
// //   const displayValue =
// //     selectedOption?.label || (value && value !== OTHER_VALUE ? value : "");

// //   if (isCompleted) {
// //     return (
// //       <div
// //         className={`text-sm font-medium ms-1 mt-5 text-platinum-800 py-2 rounded-md text-sm font-medium border max-w-10 text-center`}
// //         style={{ backgroundColor: selectedOption?.color }}
// //       >
// //         {displayValue || "-"}
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="flex flex-wrap gap-2 mt-2">
// //       {options.map((item: any) => {
// //         const isSelected =
// //           item.value === value || (item.value === "other" && isOtherActive);

// //         const isDisabled = disabledOptions.includes(item.value);

// //         //   function cn(arg0: string, arg1: any, arg2: string): string | undefined {
// //         //       throw new Error("Function not implemented.");
// //         //   }

// //         return (
// //           <div
// //             key={item.value}
// //             onClick={() => {
// //               if (isDisabled) return;

// //               if (item.value === "other") {
// //                 onChange(OTHER_VALUE);
// //                 setIsOtherShow(true);
// //               } else {
// //                 onChange(item.value);
// //                 setIsOtherShow(false);
// //               }
// //             }}
// //             className={cn(
// //               "cursor-pointer rounded-lg border p-3 flex flex-col items-center gap-2 transition-all",
// //               isDisabled && "opacity-40 cursor-not-allowed",
// //               isSelected
// //                 ? "border-black ring-2 ring-offset-2 scale-105"
// //                 : "border-gray-300 hover:border-gray-500",
// //             )}
// //           >
// //             {/* Color circle */}
// //             <div
// //               className="w-4 h-4 rounded-full"
// //               style={{
// //                 backgroundColor: item.color,
// //                 boxShadow: isSelected ? "0 0 0 3px rgba(0,0,0,0.15)" : "none",
// //               }}
// //             />
// //             <span
// //               className={isSelected ? "font-bold text-black" : "text-gray-700"}
// //             >
// //               {item.label}
// //             </span>
// //           </div>
// //         );
// //       })}

// //       {/* {isOtherActive && (
// //         <div className="w-full">
// //           <Input
// //             type="text"
// //             autoFocus
// //             value={value === OTHER_VALUE ? "" : value}
// //             onChange={e => onChange(e.target.value)}
// //             placeholder="Enter"
// //             className="mt-2"
// //           />
// //         </div>
// //       )} */}
// //     </div>
// //   );
// // }

// import { useState } from "react";
// import { cn } from "../../../lib/utils";

// const OTHER_VALUE = "__other__";

// /* ---------- Types ---------- */
// type ShadeOption = {
//   value: string;
//   label: string;
//   color: string;
// };

// type Props = {
//   options: ShadeOption[];
//   value: string;
//   onChange: (value: string) => void;
//   disabledOptions?: string[];
//   isCompleted?: boolean;
// };

// /* ---------- Component ---------- */
// export function SelectableToothGrid({
//   options,
//   value,
//   onChange,
//   disabledOptions = [],
//   isCompleted = false,
// }: Props) {
//   const [isOtherShow, setIsOtherShow] = useState(false);

//   const isOtherActive = isOtherShow || value === OTHER_VALUE;

//   const selectedOption = options.find((item) => item.value === value);
//   const displayValue =
//     selectedOption?.label || (value && value !== OTHER_VALUE ? value : "");

//   /* ---------- Read-only / completed ---------- */
//   if (isCompleted) {
//     return (
//       <div
//         className="mt-2 inline-flex items-center justify-center rounded-md border px-2 py-1 text-xs font-semibold"
//         style={{ backgroundColor: selectedOption?.color }}
//       >
//         {displayValue || "-"}
//       </div>
//     );
//   }

//   /* ---------- Selectable grid ---------- */
//   return (
//     <div className="flex flex-wrap gap-2 mt-2">
//       {options.map((item) => {
//         const isSelected =
//           item.value === value ||
//           (item.value === "other" && isOtherActive);

//         const isDisabled = disabledOptions.includes(item.value);

//         return (
//           <div
//             key={item.value}
//             role="button"
//             aria-pressed={isSelected}
//             onClick={() => {
//               if (isDisabled) return;

//               if (item.value === "other") {
//                 onChange(OTHER_VALUE);
//                 setIsOtherShow(true);
//               } else {
//                 onChange(item.value);
//                 setIsOtherShow(false);
//               }
//             }}
//             className={cn(
//               // ⬇️ smaller box
//               "cursor-pointer rounded-md border px-2 py-1.5 flex flex-col items-center gap-1 transition-all",
//               "text-xs min-w-[48px]",
//               isDisabled && "opacity-40 cursor-not-allowed",
//               isSelected
//                 ? "border-black ring-2 ring-black/20 scale-[1.04]"
//                 : "border-gray-300 hover:border-gray-500"
//             )}
//           >
//             {/* Color dot */}
//             <div
//               className="w-3.5 h-3.5 rounded-full"
//               style={{
//                 backgroundColor: item.color,
//                 boxShadow: isSelected
//                   ? "0 0 0 2px rgba(0,0,0,0.2)"
//                   : "none",
//               }}
//             />

//             {/* Label for showing selected teeth shade here */}
//             <span
//               className={cn(
//                 "leading-none",
//                 isSelected ? "font-semibold text-black" : "text-gray-700"
//               )}
//             >
//               {item.label}
//             </span>
//           </div>
//         );
//       })}
//     </div>
//   );
// }
// import { useState } from "react";
import { cn } from "../../../lib/utils";

// const OTHER_VALUE = "__other__";

type ShadeOption = {
  value: string;
  label: string;
  color: string;
};

type Props = {
  options: ShadeOption[];
  value: string;
  onChange: (value: string) => void;
  disabledOptions?: string[];
  isCompleted?: boolean;
};

export function SelectableToothGrid({
  options,
  value,
  onChange,
  disabledOptions = [],
  isCompleted = false,
}: Props) {
//   const [isOtherShow, setIsOtherShow] = useState(false);

  const selectedOption = options.find((o) => o.value === value);

  if (isCompleted) {
    return (
      <div
        className="inline-flex items-center justify-center rounded-md border px-3 py-1 text-sm font-semibold"
        style={{ backgroundColor: selectedOption?.color }}
      >
        {selectedOption?.label ?? "-"}
      </div>
    );
  }

  /* ---------- Selectable grid ---------- */
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {options.map((item) => {
        const isSelected = item.value === value;
        const isDisabled = disabledOptions.includes(item.value);

        return (
          <button
            key={item.value}
            type="button"
            disabled={isDisabled}
            onClick={() => {
                onChange(item.value);
              }
            }
            className={cn(
              // size & shape
              "min-w-[56px] h-10 rounded-lg border text-sm font-medium",
              "flex items-center justify-center transition-colors",
              // states
              isDisabled && "opacity-40 cursor-not-allowed",
              isSelected
                ? "border-black font-bold"
                : "border-transparent hover:opacity-90"
            )}
            style={{
              backgroundColor: item.color,
            }}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
