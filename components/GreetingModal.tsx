"use client";

import { useEffect, useState } from "react";

const GreetingModal = () => {
  const [greetingType, setGreetingType] = useState<
    "christmas" | "newYear" | null
  >(null);

  useEffect(() => {
    const today = new Date();
    const christmasStart = new Date(today.getFullYear(), 11, 20);
    const christmasEnd = new Date(today.getFullYear(), 11, 26);
    const newYearStart = new Date(today.getFullYear(), 11, 31);
    const newYearEnd = new Date(today.getFullYear() + 1, 0, 5);

    if (today >= christmasStart && today <= christmasEnd) {
      setGreetingType("christmas");
    } else if (today >= newYearStart && today <= newYearEnd) {
      setGreetingType("newYear");
    }
  }, []);

  const handleClose = () => {
    setGreetingType(null);
  };

  if (!greetingType) return null;

  const greetingContent =
    greetingType === "christmas" ? (
      <img
        src="/images/happychristmas.gif"
        alt="Merry Christmas"
        className="w-full h-auto rounded-lg"
      />
    ) : (
      <img
        src="/images/happynewyear.gif"
        alt="Happy New Year"
        className="w-full h-auto rounded-lg"
      />
    );

  return (
    <div
      className="fixed inset-0  bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleClose}
    >
      <div
        className="bg-black-600 p-4 rounded shadow-lg relative max-w-lg w-full"
        onClick={(e) => e.stopPropagation()} // Prevent click propagation
      >
        {greetingContent}

        <p className="text-center text-gray-300 font-semibold mt-4">
          From Soren Family
        </p>
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 text-black bg-white p-2 rounded-full"
        >
          ✖
        </button>
      </div>
    </div>
  );
};

export default GreetingModal;
