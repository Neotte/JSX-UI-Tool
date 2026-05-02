import { RefreshCw, Save, Upload } from "lucide-react";
import type { LoadoutSummary } from "../../shared/types";

type Props = {
  loadoutName: string;
  loadouts: LoadoutSummary[];
  isBusy: boolean;
  message: string | null;
  onNameChange: (name: string) => void;
  onSave: () => void;
  onRefresh: () => void;
  onLoad: (name: string) => void;
};

export function LoadoutSection({ loadoutName, loadouts, isBusy, message, onNameChange, onSave, onRefresh, onLoad }: Props) {
  return (
    <section className="section-layout">
      <div className="section-heading">
        <div>
          <h1>로드아웃</h1>
          <p>현재 JSX와 해상도 설정을 `saves` 폴더에 저장합니다.</p>
        </div>
        <button className="icon-text-button" type="button" onClick={onRefresh} disabled={isBusy}>
          <RefreshCw size={16} />
          새로고침
        </button>
      </div>

      <div className="loadout-tools">
        <label className="field wide-field">
          <span>로드아웃 이름</span>
          <input value={loadoutName} onChange={(event) => onNameChange(event.target.value)} />
        </label>
        <button className="primary-button" type="button" onClick={onSave} disabled={isBusy}>
          <Save size={16} />
          로드아웃 저장
        </button>
      </div>

      {message ? <p className="inline-status">{message}</p> : null}

      <div className="list-panel">
        {loadouts.length === 0 ? (
          <p className="empty-state">저장된 로드아웃이 없습니다.</p>
        ) : (
          loadouts.map((item) => (
            <button key={item.name} className="loadout-row" type="button" onClick={() => onLoad(item.name)}>
              <span>
                <strong>{item.name}</strong>
                {item.updatedAt ? <small>{new Date(item.updatedAt).toLocaleString()}</small> : null}
              </span>
              <Upload size={16} />
            </button>
          ))
        )}
      </div>
    </section>
  );
}
