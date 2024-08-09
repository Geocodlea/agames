"use client";

import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import { useSelectedLayoutSegments } from "next/navigation";
import Image from "next/image";
import bg from "/public/img/bg.jpg";
import catanBg from "/public/img/catan_bg.jpg";
import cavaleriBg from "/public/img/cavaleri_bg.jpg";
import whistBg from "/public/img/whist_bg.jpg";
import rentzBg from "/public/img/rentz_bg.jpg";
import aboutBg from "/public/img/about_bg.jpg";
import contactBg from "/public/img/contact_bg.jpg";
import profileBg from "/public/img/profile_bg.jpg";

function Banner({ children }) {
  const segments = useSelectedLayoutSegments();
  const [segment, secondSegment] = segments;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  let imageUrl;
  const imageUrls = [catanBg, whistBg, cavaleriBg, rentzBg, profileBg];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageUrls.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval); // Clean up interval on unmount
  }, []);

  if (segments.length === 0) {
    imageUrl = imageUrls[currentImageIndex];
  } else if (segments.length === 1) {
    switch (segment) {
      case "about":
        imageUrl = aboutBg;
        break;
      case "contact":
        imageUrl = contactBg;
        break;
      case "profile":
        imageUrl = profileBg;
        break;
      default:
        imageUrl = bg;
    }
  } else if (segments[0] === "events") {
    const eventType = secondSegment.split("/")[0];
    switch (eventType) {
      case "catan":
        imageUrl = catanBg;
        break;
      case "cavaleri":
        imageUrl = cavaleriBg;
        break;
      case "whist":
        imageUrl = whistBg;
        break;
      case "rentz":
        imageUrl = rentzBg;
        break;
      default:
        imageUrl = catanBg;
    }
  } else {
    imageUrl = bg;
  }

  return (
    <>
      <Box
        sx={{
          position: "absolute",
          width: "100%",
          height: "30vh",
          zIndex: -1,
        }}
      >
        <Image
          alt="background"
          src={imageUrl}
          placeholder="blur"
          fill
          sizes="100vw"
          style={{
            zIndex: -2,
            objectFit: "cover",
          }}
        />
      </Box>
      {children}
    </>
  );
}

export default Banner;
