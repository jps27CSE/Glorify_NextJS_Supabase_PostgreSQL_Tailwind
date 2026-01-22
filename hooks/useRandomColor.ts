import { useEffect, useState } from "react";

const useRandomColor = () => {
  const colors = [
    "from-blue-900",
    "from-green-900",
    "from-red-900",
    "from-purple-900",
    "from-yellow-900",
  ];

  const [color, setColor] = useState<string | null>(null);

  const getRandomColor = () =>
    colors[Math.floor(Math.random() * colors.length)];

  useEffect(() => {
    // Set color only on client side to avoid hydration mismatch
    setColor(getRandomColor());
  }, []);

  const shuffleColor = () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment

    setColor(getRandomColor());
  };

  return { color, colors, shuffleColor };
};

export default useRandomColor;
