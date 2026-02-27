"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Box } from "lucide-react";
import { getPresignedViewUrl } from "../api/multipart-upload";

type Props = {
  fileKey: string;         // S3 key (NOT full URL)
  fileName?: string;
};

const iosViewerBaseUrl =
  import.meta.env.VITE_IOS_VIEWER_BASE_URL || "";

export default function StlExternalViewer({ fileKey, fileName }: Props) {
  const [loading, setLoading] = useState(false);

  const onViewStl = async () => {
    if (!fileKey) return;

    try {
      setLoading(true);

      const presignedUrl = await getPresignedViewUrl(fileKey);

      const extension = fileName?.split(".").pop()?.toLowerCase();
      const projectFormat =
        extension === "stl" || extension === "ply"
          ? extension
          : "stl";

      const viewerUrl =
        `${iosViewerBaseUrl}projectFormat=${projectFormat}` +
        `&url=${encodeURIComponent(presignedUrl)}`;

      window.open(
        viewerUrl,
        "_blank",
        "width=1200,height=800,scrollbars=yes,resizable=yes"
      );
    } catch (error) {
      console.error("Error opening STL:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={onViewStl}
      disabled={loading}
      className="flex items-center gap-2"
    >
      <Box className="w-4 h-4" />
      {loading ? "Opening..." : "View 3D Model"}
    </Button>
  );
}