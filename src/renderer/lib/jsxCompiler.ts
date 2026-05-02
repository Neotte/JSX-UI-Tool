import * as Babel from "@babel/standalone";
import React from "react";

const FORBIDDEN_PATTERNS: Array<[RegExp, string]> = [
  [/\buse(State|Effect|Memo|Ref|Reducer|Callback|Context|LayoutEffect|ImperativeHandle|Transition|DeferredValue|Id|SyncExternalStore)\b/, "React Hook은 이 도구의 정적 에셋 범위에서 사용할 수 없습니다."],
  [/\b(require|process|globalThis)\b/, "Node 또는 전역 런타임 객체에 직접 접근할 수 없습니다."],
  [/\b(eval|Function)\b/, "eval 또는 Function 생성자는 사용할 수 없습니다."],
  [/\b(fetch|XMLHttpRequest|WebSocket)\b/, "네트워크 요청 코드는 사용할 수 없습니다."],
  [/import\s*\(/, "동적 import는 사용할 수 없습니다."],
  [/window\.(localApi|api|exportBridge)/, "내부 API에는 JSX 코드에서 접근할 수 없습니다."]
];

export type CompileResult = {
  Component: React.ComponentType;
  error: string | null;
};

export function compileJsxComponent(source: string): CompileResult {
  for (const [pattern, message] of FORBIDDEN_PATTERNS) {
    if (pattern.test(source)) {
      return { Component: EmptyComponent, error: message };
    }
  }

  try {
    const transformed = Babel.transform(source, {
      presets: [["react", { runtime: "classic" }]],
      plugins: ["transform-modules-commonjs"],
      sourceType: "module"
    }).code;

    if (!transformed) {
      return { Component: EmptyComponent, error: "JSX 변환 결과가 비어 있습니다." };
    }

    const module = { exports: {} as Record<string, unknown> };
    const exports = module.exports;
    const factory = new Function(
      "React",
      "module",
      "exports",
      `"use strict";\n${transformed}\nreturn module.exports.default || exports.default || Component;`
    );
    const Component = factory(React, module, exports);

    if (typeof Component !== "function") {
      return { Component: EmptyComponent, error: "export default Component 형태의 컴포넌트가 필요합니다." };
    }

    return { Component, error: null };
  } catch (error) {
    return {
      Component: EmptyComponent,
      error: error instanceof Error ? error.message : "JSX 렌더링 중 오류가 발생했습니다."
    };
  }
}

function EmptyComponent() {
  return null;
}
