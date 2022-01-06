import { useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import Head from "next/head";

export default function Annotate() {
  const [polygons, setPolygons] = useState([]);
  const [selectedObject, setSelectedObject] = useState(null);
  const backgroundRef = useRef();
  const image = useRef();

  function startDraw(e) {
    const { x, y } = backgroundRef.current.getBoundingClientRect();
    const { clickPositionX, clickPositionY } = getCoordinates(e, x, y);
    const position = polygons.findIndex(
      (object) => object.id === selectedObject
    );

    if (position != -1) {
      const items = [...polygons];
      const item = { ...items[position] };
      item.data.push({ x: clickPositionX, y: clickPositionY });
      items[position] = item;
      setPolygons(items);
    } else {
      const object = {
        id: selectedObject,
        data: [
          {
            x: clickPositionX,
            y: clickPositionY,
          },
        ],
      };
      setPolygons((polygons) => [...polygons, object]);
    }
  }

  function getCoordinates(e) {
    const { x, y } = backgroundRef.current.getBoundingClientRect();
    const { clientX, clientY } = e;
    const clickPositionX = clientX - x;
    const clickPositionY = clientY - y;
    return { clickPositionX, clickPositionY };
  }

  function deleteAnnotation(id) {
    const newPolygons = polygons.filter((object) => object.id !== id);
    setPolygons(newPolygons);
  }

  function newAnnotation() {
    setSelectedObject(uuidv4());
  }

  function finishAnnotation() {
    setSelectedObject(null);
  }

  function getPositionString(item) {
    const position = item.data.map((coordinate) => {
      return `${coordinate.x}/${coordinate.y} `;
    });

    const positionString = position
      .toString()
      .replaceAll(",", " ")
      .replaceAll("/", ",");
    return positionString;
  }

  return (
    <div>
      <Head>
        <title>Image Annotation</title>
        <meta name="description" content="Image Annotation" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="container">
        <div>
          <div className="box" ref={backgroundRef} onClick={startDraw}>
            <img
              src="https://i.picsum.photos/id/947/536/354.jpg?hmac=SWrzGjeEE8tsTHphNhl2ma3QToFb3nDd5hLIbtWX69s"
              alt="Image to annotate"
              ref={image}
            />
            <svg className="svg">
              {image.current && (
                <rect
                  x="0"
                  y="0"
                  width={image.current.naturalWidth}
                  height={image.current.naturalHeight}
                  fill="transparent"
                />
              )}
              <g>
                {polygons.map((item) => {
                  return (
                    <polygon
                      key={item.id}
                      points={getPositionString(item)}
                      className="polygon"
                    />
                  );
                })}
              </g>
            </svg>
          </div>
          {selectedObject != null ? (
            <button onClick={finishAnnotation}>Finish Annotation</button>
          ) : (
            <button onClick={newAnnotation}>New Annotation</button>
          )}
        </div>
        <div className="panel">
          {polygons.map((item) => {
            return (
              <div className="object" key={item.id}>
                <span>Object ID: {item.id}</span>
                <button onClick={() => deleteAnnotation(item.id)}>
                  Delete Object
                </button>
                <div className="data">
                  {item.data.map((item, index) => {
                    return (
                      <span key={index}>
                        X: {item.x}, Y: {item.y}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <style jsx>
        {`
          rect {
            cursor: crosshair;
          }

          img {
            display: block;
          }

          .container {
            display: flex;
            background-color: white;
            gap: 20px;
            padding: 10rem;
            min-height: 100vh;
          }

          .box {
            position: relative;
            margin-bottom: 16px;
          }

          .svg {
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
          }

          .polygon {
            fill: rgba(255, 0, 0, 0.1);
            stroke: red;
            cursor: crosshair;
            stroke-width: 1;
          }

          .panel {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            align-items: flex-start;
            gap: 16px;
          }

          .object {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
            border: 1px solid;
            padding: 16px;
          }

          .data {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
          }

          button {
            cursor: pointer;
            border: 1px solid;
            padding: 4px 8px;
            background: white;
          }
        `}
      </style>
    </div>
  );
}
