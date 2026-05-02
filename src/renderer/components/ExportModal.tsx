import { Download, X } from "lucide-react";
import type { ExportMode } from "../../shared/types";
import { validateFileName } from "../../shared/validation";

type Props = {
  name: string;
  mode: ExportMode;
  isBusy: boolean;
  onNameChange: (name: string) => void;
  onModeChange: (mode: ExportMode) => void;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ExportModal({ name, mode, isBusy, onNameChange, onModeChange, onCancel, onConfirm }: Props) {
  const error = validateFileName(name);

  return (
    <div className="modal-backdrop" role="presentation">
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="export-title">
        <div className="modal-header">
          <h2 id="export-title">PNG 내보내기</h2>
          <button className="icon-button" type="button" onClick={onCancel} aria-label="닫기" title="닫기">
            <X size={18} />
          </button>
        </div>
        <label className="field">
          <span>파일명</span>
          <input value={name} onChange={(event) => onNameChange(event.target.value)} autoFocus />
        </label>
        <div className="field">
          <span>정렬</span>
          <div className="segmented-control">
            <button
              type="button"
              className={mode === "canvas" ? "segment active" : "segment"}
              onClick={() => onModeChange("canvas")}
            >
              캔버스 중앙
            </button>
            <button
              type="button"
              className={mode === "crop" ? "segment active" : "segment"}
              onClick={() => onModeChange("crop")}
            >
              컴포넌트 크롭
            </button>
          </div>
        </div>
        {error ? <p className="inline-error">{error}</p> : null}
        <div className="modal-actions">
          <button type="button" className="secondary-button" onClick={onCancel}>
            취소
          </button>
          <button type="button" className="primary-button" disabled={Boolean(error) || isBusy} onClick={onConfirm}>
            <Download size={16} />
            PNG 생성
          </button>
        </div>
      </div>
    </div>
  );
}
