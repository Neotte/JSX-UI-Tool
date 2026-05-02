import { RefreshCw } from "lucide-react";
import type { ExportedImage } from "../../shared/types";
import { ImagePreviewModal } from "../components/ImagePreviewModal";

type Props = {
  files: ExportedImage[];
  selectedFile: ExportedImage | null;
  isBusy: boolean;
  message: string | null;
  onRefresh: () => void;
  onSelect: (file: ExportedImage) => void;
  onClosePreview: () => void;
};

export function GallerySection({ files, selectedFile, isBusy, message, onRefresh, onSelect, onClosePreview }: Props) {
  return (
    <section className="section-layout">
      <div className="section-heading">
        <div>
          <h1>갤러리</h1>
          <p>`exports` 폴더의 PNG를 이름순으로 확인합니다.</p>
        </div>
        <button className="icon-text-button" type="button" onClick={onRefresh} disabled={isBusy}>
          <RefreshCw size={16} />
          새로고침
        </button>
      </div>

      {message ? <p className="inline-status">{message}</p> : null}

      {files.length === 0 ? (
        <p className="empty-state">exports 폴더에 PNG 파일이 없습니다.</p>
      ) : (
        <div className="gallery-grid">
          {files.map((file) => (
            <button key={file.name} className="image-card" type="button" onClick={() => onSelect(file)}>
              <span className="thumbnail">
                <img src={file.pathOrUrl} alt={file.name} />
              </span>
              <strong title={file.name}>{file.name}</strong>
              {file.sizeBytes ? <small>{Math.round(file.sizeBytes / 1024)} KB</small> : null}
            </button>
          ))}
        </div>
      )}

      {selectedFile ? <ImagePreviewModal file={selectedFile} onClose={onClosePreview} /> : null}
    </section>
  );
}
