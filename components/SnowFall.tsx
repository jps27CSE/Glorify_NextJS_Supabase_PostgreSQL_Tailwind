"use client";
import { useEffect, useState } from "react";
import { Snowfall } from "react-snowfall";

const SnowFall = () => {
  const [images, setImages] = useState([]);
  const [showSnowfall, setShowSnowfall] = useState(false);

  useEffect(() => {
    const today = new Date();
    const month = today.getMonth(); // Months are zero-indexed (0 = January, 11 = December)
    const day = today.getDate();

    const isSnowfallPeriod =
      (month === 11 && ((day >= 1 && day <= 10) || (day >= 20 && day <= 25))) || // December
      (month === 0 && ((day >= 1 && day <= 10) || (day >= 20 && day <= 25))); // January

    setShowSnowfall(isSnowfallPeriod);
  }, []);

  useEffect(() => {
    const snowflake = new Image();
    snowflake.src = "/images/snowflake.png";
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    snowflake.onload = () => setImages([snowflake]);
  }, []);

  if (!showSnowfall) {
    return null;
  }

  return (
    <Snowfall
      snowflakeCount={7}
      images={images}
      radius={[10, 20]}
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        background: "transparent",
      }}
    />
  );
};

export default SnowFall;
