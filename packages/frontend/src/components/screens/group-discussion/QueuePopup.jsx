import React from "react";
import { DoubleTapPopup } from "../../shared";

export function QueuePopup() {
  return (
    <div>
      <DoubleTapPopup onKey="q" draggable draggableOptions>
        <div className="absolute h-40 w-80 space-y-4 justify-center inset-4 bg-green-400 z-50 rounded-md">
          <p>Discussion Queue</p>
          <div className=" flex items-center bg-green-700 h-full overflow-y-scroll rounded-md"></div>
        </div>
      </DoubleTapPopup>
    </div>
  );
}
