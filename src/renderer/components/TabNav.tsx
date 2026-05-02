import { FolderOpen, Image, PenTool } from "lucide-react";

export type TabId = "workspace" | "loadouts" | "gallery";

const tabs = [
  { id: "workspace" as const, label: "작업 구역", Icon: PenTool },
  { id: "loadouts" as const, label: "로드아웃", Icon: FolderOpen },
  { id: "gallery" as const, label: "갤러리", Icon: Image }
];

type Props = {
  activeTab: TabId;
  onChange: (tab: TabId) => void;
};

export function TabNav({ activeTab, onChange }: Props) {
  return (
    <nav className="tab-nav" aria-label="섹션">
      {tabs.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          className={id === activeTab ? "tab-button active" : "tab-button"}
          onClick={() => onChange(id)}
        >
          <Icon size={17} />
          {label}
        </button>
      ))}
    </nav>
  );
}
