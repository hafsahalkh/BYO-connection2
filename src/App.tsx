import { SpecodeIframeTracker } from "@/components/layout/SpecodeIframeTracker";

function SpecodeMark() {
  return (
    <svg
      aria-hidden="true"
      className="preview-placeholder-mark"
      viewBox="0 6 24 16"
      fill="none"
    >
      <path
        d="M0 12C0 8.68629 2.68629 6 6 6H12L7 13L12.7378 7.97938C14.1962 6.70334 16.0681 6 18.0059 6H24V14C24 18.4183 20.4183 22 16 22H8C3.58172 22 0 18.4183 0 14V12Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function App() {
  return (
    <>
      <SpecodeIframeTracker />
      <main className="preview-placeholder-shell">
        <div className="preview-placeholder-content">
          <SpecodeMark />
          <p className="preview-placeholder-copy">
            Specode is planning your app...
          </p>
        </div>
      </main>
    </>
  );
}
