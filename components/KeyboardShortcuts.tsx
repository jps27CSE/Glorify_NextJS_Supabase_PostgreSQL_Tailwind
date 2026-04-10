"use client";

import Modal from "@/components/Modal";

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onChange: (open: boolean) => void;
}

const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({ isOpen, onChange }) => {
  const shortcuts = [
    { key: "Space", description: "Play / Pause" },
    { key: "Arrow Left", description: "Previous Song" },
    { key: "Arrow Right", description: "Next Song" },
    { key: "Arrow Up", description: "Increase Volume (+10%)" },
    { key: "Arrow Down", description: "Decrease Volume (-10%)" },
    { key: "S", description: "Toggle Shuffle" },
    { key: "M", description: "Mute / Unmute" },
    { key: "R", description: "Rewind 10 seconds" },
    { key: "F", description: "Fast Forward 10 seconds" },
  ];

  return (
    <Modal 
      isOpen={isOpen} 
      onChange={onChange}
      title="Keyboard Shortcuts"
      description="Learn the keyboard shortcuts to control your music"
    >
      <div className="space-y-3">
        {shortcuts.map((shortcut, index) => (
          <div key={index} className="flex justify-between items-center text-neutral-300">
            <span className="font-mono bg-neutral-700 px-2 py-1 rounded text-sm">
              {shortcut.key}
            </span>
            <span className="text-sm">{shortcut.description}</span>
          </div>
        ))}
      </div>
    </Modal>
  );
};

export default KeyboardShortcuts;
