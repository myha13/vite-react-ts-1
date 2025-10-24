import { useState, useEffect, useRef } from "react";

const imagesPerPage = 5;

type picsumImage = {
  id: number;
  height: number;
  width: number;
  download_url: string;
  url: string;
  author: string;
};

export default function ScrollPage2() {
  const [currentPage, setCurrentPage] = useState(1);
  const [images, setImages] = useState<picsumImage[]>([]);
  const [loading, setLoading] = useState(false);
  const loadMoreRef = useRef<HTMLButtonElement | null>(null);
  const loadingRef = useRef(false);

  const fetchData = async (pageNumber: number) => {
    setLoading(true);

    try {
      const url = `https://picsum.photos/v2/list?page=${pageNumber}&limit=${imagesPerPage}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const jsonData = await response.json();
      setImages((prevImages) => [...prevImages, ...jsonData]);
      // jsonData.forEach((item: picsumImage) => {
      //   setImages((prevImages) => {
      //     // const exists = prevImages.some(
      //     //   (existingImage) => existingImage["id"] === item["id"]
      //     // );
      //     // return exists ? prevImages : [...prevImages, item];
      //     return [...prevImages, item];
      //   });
      // });
      setLoading(false);
    } catch (error) {
      console.error("Error loading JSON:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 1.0,
    };
    const callback = function (
      entries: IntersectionObserverEntry[],
      _observer: IntersectionObserver
    ) {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !loadingRef.current) {
          setCurrentPage((prevPage) => prevPage + 1);
        }
      });
    };
    const observer = new IntersectionObserver(callback, options);
    console.log("Connect observer");

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      console.log("Disconnecting observer");
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage]);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  return (
    <>
      <h1>Infinite Scroll</h1>
      <div className="images-container">
        {images.map((item) => (
          <img key={item.id} src={item.download_url} />
        ))}
        <button ref={loadMoreRef}>Load more</button>
      </div>
    </>
  );
}
