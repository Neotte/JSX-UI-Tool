import { X } from "lucide-react";
import type { ExportedImage } from "../../shared/types";

type Props = {
  file: ExportedImage;
  onClose: () => void;
};

export function ImagePreviewModal({ file, onClose }: Props) {
  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div className="image-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h2>{file.name}</h2>
          <button className="icon-button" type="button" onClick={onClose} aria-label="닫기" title="닫기">
            <X size={18} />
          </button>
        </div>
        <div className="image-preview-frame">
          <img src={file.pathOrUrl} alt={file.name} />
        </div>
      </div>
    </div>
  );
}
