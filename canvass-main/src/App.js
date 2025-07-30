import { useRef, useEffect, useState } from "react";
import { BiSolidPencil } from "react-icons/bi";
import { FaRegSquareFull } from "react-icons/fa6";
import { GoCircle } from "react-icons/go";
import { FaLongArrowAltRight } from "react-icons/fa";
import { IoRemoveOutline } from "react-icons/io5";
import { TbOvalVertical } from "react-icons/tb";
import { BiUndo } from "react-icons/bi";
import { CiEraser } from "react-icons/ci";
import iro from '@jaames/iro';
import './App.css';

function App() {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const colorPickerRef = useRef(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [paths, setPaths] = useState([]);
  const [lineWidth, setLineWidth] = useState(2);
  const [drawingMode, setDrawingMode] = useState('freehand');
  const [lineColor, setLineColor] = useState("black");
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [activeTool, setActiveTool] = useState('freehand');

  

  useEffect(() => {
    const canvas = canvasRef.current;

    canvas.width = window.innerWidth * 2;
    canvas.height = window.innerHeight * 2;

    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    const context = canvas.getContext("2d");
    context.scale(2, 2);
    context.lineCap = "round";
    context.strokeStyle = lineColor;
    context.lineWidth = lineWidth;
    contextRef.current = context;

    // Clear previous instances if any
    if (colorPickerRef.current) {
      colorPickerRef.current.innerHTML = '';
    }

    // Initialize the color picker
    const colorPicker = new iro.ColorPicker(colorPickerRef.current, {
      width: 150,
      color: "#fff",
    });

    colorPicker.on('color:change', (color) => {
      handleColor({ target: { value: color.hexString } });
    });

    getCoordinates();

  }, []); // Empty dependency array ensures this runs only once

  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.lineWidth = lineWidth;
    }
  }, [lineWidth]);

  const resetCanvas = () => {
    localStorage.clear();    
    window.location.reload();
  }
  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    setIsDrawing(true);

    if (drawingMode === 'freehand' || drawingMode === 'eraser') {
      contextRef.current.beginPath();
      contextRef.current.moveTo(offsetX, offsetY);
      setPaths((prevPaths) => [...prevPaths, { type: drawingMode, color: lineColor, width: lineWidth, coordinates: [] }]);
    } else if (drawingMode === "line" || drawingMode === "rectangle" || drawingMode === "circle" || drawingMode === "arrow" || drawingMode === "ellipse") {
      setStartPosition({ x: offsetX, y: offsetY });
    }
  };
  const finishDrawing = ({ nativeEvent }) => {
    if (isDrawing) {
      setIsDrawing(false);
    }

    //---->Line
    if (drawingMode === 'line') {
      const { offsetX, offsetY } = nativeEvent;
      const { x, y } = startPosition;

      const newPath = {
        type: "line",
        color: lineColor,
        width: lineWidth,
        startX: x,
        startY: y,
        endX: offsetX,
        endY: offsetY,
      };

      setPaths((prevPaths) => {
        const updatedPaths = [...prevPaths, newPath];
        localStorage.setItem('paths', JSON.stringify(updatedPaths));
        return updatedPaths;
      });

      contextRef.current.beginPath();
      contextRef.current.moveTo(x, y);
      contextRef.current.lineTo(offsetX, offsetY);
      contextRef.current.strokeStyle = lineColor;
      contextRef.current.lineWidth = lineWidth;
      contextRef.current.stroke();
      contextRef.current.closePath();
    }

    //--->Rectangle
    if (drawingMode === 'rectangle') {
      const { offsetX, offsetY } = nativeEvent;
      const { x, y } = startPosition;

      const newPath = {
        type: "rectangle",
        color: lineColor,
        width: lineWidth,
        startX: x,
        startY: y,
        endX: offsetX,
        endY: offsetY,
      };

      setPaths((prevPaths) => {
        const updatedPaths = [...prevPaths, newPath];
        localStorage.setItem('paths', JSON.stringify(updatedPaths));
        return updatedPaths;
      });

      contextRef.current.beginPath();
      contextRef.current.rect(x, y, offsetX - x, offsetY - y);
      contextRef.current.strokeStyle = lineColor;
      contextRef.current.lineWidth = lineWidth;
      contextRef.current.stroke();
      contextRef.current.closePath();
    }

    //--->Circle 
    else if (drawingMode === 'circle') {
      const { offsetX, offsetY } = nativeEvent;
      const { x, y } = startPosition;

      const radius = Math.sqrt(Math.pow(offsetX - x, 2) + Math.pow(offsetY - y, 2));

      const newPath = {
        type: "circle",
        color: lineColor,
        width: lineWidth,
        centerX: x,
        centerY: y,
        radius: radius,
      };

      setPaths((prevPaths) => {
        const updatedPaths = [...prevPaths, newPath];
        localStorage.setItem('paths', JSON.stringify(updatedPaths));
        return updatedPaths;
      });

      contextRef.current.beginPath();
      contextRef.current.arc(x, y, radius, 0, 2 * Math.PI);
      contextRef.current.strokeStyle = lineColor;
      contextRef.current.lineWidth = lineWidth;
      contextRef.current.stroke();
      contextRef.current.closePath();
    }

    //---->Arrow
    else if (drawingMode === 'arrow') {
      const { offsetX, offsetY } = nativeEvent;
      const { x, y } = startPosition;

      const newPath = {
        type: "arrow",
        color: lineColor,
        width: lineWidth,
        startX: x,
        startY: y,
        endX: offsetX,
        endY: offsetY,
      };

      setPaths((prevPaths) => {
        const updatedPaths = [...prevPaths, newPath];
        localStorage.setItem('paths', JSON.stringify(updatedPaths));
        return updatedPaths;
      });

      drawArrow(x, y, offsetX, offsetY, lineColor, lineWidth);
    }

    //---->Ellipse
    else if (drawingMode === 'ellipse') {
      const { offsetX, offsetY } = nativeEvent;
      const { x, y } = startPosition;

      const radiusX = Math.abs(offsetX - x) / 2;
      const radiusY = Math.abs(offsetY - y) / 2;
      const centerX = (offsetX + x) / 2;
      const centerY = (offsetY + y) / 2;

      const newPath = {
        type: "ellipse",
        color: lineColor,
        width: lineWidth,
        centerX: centerX,
        centerY: centerY,
        radiusX: radiusX,
        radiusY: radiusY,
      };

      setPaths((prevPaths) => {
        const updatedPaths = [...prevPaths, newPath];
        localStorage.setItem('paths', JSON.stringify(updatedPaths));
        return updatedPaths;
      });

      contextRef.current.beginPath();
      contextRef.current.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
      contextRef.current.strokeStyle = lineColor;
      contextRef.current.lineWidth = lineWidth;
      contextRef.current.stroke();
      contextRef.current.closePath();
    }

    //---->Eraser
    else if (drawingMode === 'eraser') {
      const { offsetX, offsetY } = nativeEvent;

      const newPath = {
        type: "eraser",
        color: "white", // Assuming your canvas background is white
        width: lineWidth * 2, // Make the eraser larger
        coordinates: [],
      };

      setPaths((prevPaths) => {
        const updatedPaths = [...prevPaths, newPath];
        localStorage.setItem('paths', JSON.stringify(updatedPaths));
        return updatedPaths;
      });
    }
  };
  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;

    const { offsetX, offsetY } = nativeEvent;

    //---Draw freehand---//
    if (drawingMode === 'freehand' || drawingMode === 'eraser') {
      setPaths((prevPaths) => {
        const newPaths = [...prevPaths];
        const currentPath = newPaths[newPaths.length - 1];
        currentPath.coordinates.push({ offsetX, offsetY });
        localStorage.setItem('paths', JSON.stringify(newPaths));
        return newPaths;
      });

      contextRef.current.lineTo(offsetX, offsetY);
      contextRef.current.strokeStyle = drawingMode === 'eraser' ? "white" : lineColor; // Use white for eraser
      contextRef.current.lineWidth = drawingMode === 'eraser' ? lineWidth * 2 : lineWidth;
      contextRef.current.stroke();
    }

    //---Draw Line---//
    else if (drawingMode === 'line') {
      const { x, y } = startPosition;
      redrawCanvas(paths);
      contextRef.current.beginPath();
      contextRef.current.moveTo(x, y);
      contextRef.current.lineTo(offsetX, offsetY);
      contextRef.current.strokeStyle = lineColor;
      contextRef.current.lineWidth = lineWidth;
      contextRef.current.stroke();
      contextRef.current.closePath();
    }

    //---Draw rectangle---//
    else if (drawingMode === 'rectangle') {
      const { x, y } = startPosition;
      redrawCanvas(paths);
      contextRef.current.beginPath();
      contextRef.current.rect(x, y, offsetX - x, offsetY - y);
      contextRef.current.strokeStyle = lineColor;
      contextRef.current.lineWidth = lineWidth;
      contextRef.current.stroke();
      contextRef.current.closePath();
    }

    //---Draw Circle---//
    else if (drawingMode === 'circle') {
      const { x, y } = startPosition;
      redrawCanvas(paths);
      const radius = Math.sqrt(Math.pow(offsetX - x, 2) + Math.pow(offsetY - y, 2));
      contextRef.current.beginPath();
      contextRef.current.arc(x, y, radius, 0, 2 * Math.PI);
      contextRef.current.strokeStyle = lineColor;
      contextRef.current.lineWidth = lineWidth;
      contextRef.current.stroke();
      contextRef.current.closePath();
    }

    //---Draw Arrow---//
    else if (drawingMode === 'arrow') {
      const { x, y } = startPosition;
      redrawCanvas(paths);
      drawArrow(x, y, offsetX, offsetY);
    }

    //---Draw Ellipse---//
    else if (drawingMode === 'ellipse') {
      const { x, y } = startPosition;
      redrawCanvas(paths);

      const radiusX = Math.abs(offsetX - x) / 2;
      const radiusY = Math.abs(offsetY - y) / 2;
      const centerX = (offsetX + x) / 2;
      const centerY = (offsetY + y) / 2;

      contextRef.current.beginPath();
      contextRef.current.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
      contextRef.current.strokeStyle = lineColor;
      contextRef.current.lineWidth = lineWidth;
      contextRef.current.stroke();
      contextRef.current.closePath();
    }
  };
  const handleLineWidth = (event) => {
    setLineWidth(event.target.value);
  };
  const handleColor = (event) => {
    setLineColor(event.target.value);
    if (contextRef.current) {
      contextRef.current.strokeStyle = event.target.value;
    }
  };
  const getCoordinates = () => {
    const storedPaths = localStorage.getItem('paths');
    if (storedPaths) {
      const parsedPaths = JSON.parse(storedPaths);
      setPaths(parsedPaths);
      redrawCanvas(parsedPaths);
    }
  };
  const redrawCanvas = (paths) => {
    const context = contextRef.current;
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    paths.forEach(path => {
      if (path.type === 'freehand' && path.coordinates.length > 0) {
        context.beginPath();
        context.strokeStyle = path.color;
        context.lineWidth = path.width;
        context.moveTo(path.coordinates[0].offsetX, path.coordinates[0].offsetY);
        path.coordinates.forEach(({ offsetX, offsetY }) => {
          context.lineTo(offsetX, offsetY);
        });
        context.stroke();
        context.closePath();
      }
      else if (path.type === 'line') {
        context.beginPath();
        context.moveTo(path.startX, path.startY);
        context.lineTo(path.endX, path.endY);
        context.strokeStyle = path.color;
        context.lineWidth = path.width;
        context.stroke();
        context.closePath();
      }
      else if (path.type === 'rectangle') {
        context.beginPath();
        context.strokeStyle = path.color;
        context.lineWidth = path.width;
        context.rect(path.startX, path.startY, path.endX - path.startX, path.endY - path.startY);
        context.stroke();
        context.closePath();
      }
      else if (path.type === 'circle') {
        context.beginPath();
        context.strokeStyle = path.color;
        context.lineWidth = path.width;
        context.arc(path.centerX, path.centerY, path.radius, 0, 2 * Math.PI);
        context.stroke();
        context.closePath();
      }
      else if (path.type === 'arrow') {
        drawArrow(path.startX, path.startY, path.endX, path.endY, path.color, path.width);
      }
      else if (path.type === 'ellipse') {
        context.beginPath();
        context.ellipse(path.centerX, path.centerY, path.radiusX, path.radiusY, 0, 0, 2 * Math.PI);
        context.strokeStyle = path.color;
        context.lineWidth = path.width;
        context.stroke();
        context.closePath();
      }
      else if (path.type === 'eraser' && path.coordinates.length > 0) {
        context.beginPath();
        context.strokeStyle = "white"; // Assuming the background is white
        context.lineWidth = path.width;
        context.moveTo(path.coordinates[0].offsetX, path.coordinates[0].offsetY);
        path.coordinates.forEach(({ offsetX, offsetY }) => {
          context.lineTo(offsetX, offsetY);
        });
        context.stroke();
        context.closePath();
      }
    });
  };
  // Functionality for drawing Arrow its head and tails
  const drawArrow = (fromX, fromY, toX, toY, pathColor, pathWidth) => {
    const headLength = 15; // Head length

    const angle = Math.atan2(toY - fromY, toX - fromX);

    contextRef.current.beginPath();
    contextRef.current.moveTo(fromX, fromY);
    contextRef.current.lineTo(toX, toY);

    // ----- Draw Arrow Head
    contextRef.current.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
    contextRef.current.moveTo(toX, toY);
    contextRef.current.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));

    // ----- Arrow Styling
    contextRef.current.strokeStyle = pathColor;
    contextRef.current.lineWidth = pathWidth;
    contextRef.current.stroke();
    contextRef.current.closePath();
  };
  const undo = () => {
    setPaths((prevPaths) => {
      if (prevPaths.length === 0) return prevPaths;

      const updatedPaths = prevPaths.slice(0, -1);

      localStorage.setItem('paths', JSON.stringify(updatedPaths));

      redrawCanvas(updatedPaths);
      return updatedPaths;
    });
  };

  const setFreehandMode = () => {
    setDrawingMode('freehand');
    setActiveTool('freehand');
  };
  const setRectangleMode = () => {
    setDrawingMode('rectangle');
    setActiveTool('rectangle');
  };
  const setCircleMode = () => {
    setDrawingMode('circle');
    setActiveTool('circle');
  };
  const setArrowMode = () => {
    setDrawingMode('arrow');
    setActiveTool('arrow');
  };
  const setEllipseMode = () => {
    setDrawingMode('ellipse');
    setActiveTool('ellipse');
  };
  const setLineMode = () => {
    setDrawingMode('line');
    setActiveTool('line');
  };
  const setEraserMode = () => {
    setDrawingMode('eraser');
    setActiveTool('eraser');
  };

  return (
    <>
      <div className="main">

        <div className="tools-side">
          <p className="color-picker-text">Choose Color</p>
          <div ref={colorPickerRef} className="color-picker"></div>

          <p className="color-picker-text">Choose Stroke</p>

          <select className="dropdown" value={lineWidth} onChange={handleLineWidth}>
            <option value={1}>Stroke</option>
            <option value={2}>2 px</option>
            <option value={4}>4 px</option>
            <option value={6}>6 px</option>
            <option value={8}>8 px</option>
          </select>
          {/* 
          <p className="color-picker-text">Set Opacity</p>
          <input type="range" className="range" value={1} min={0.1} max={1}/> */}

          <div className="button-side-panel">
            <button className="button-restore" onClick={getCoordinates}>Restore</button>
            <button className="button-undo" onClick={undo}><BiUndo /></button>
          </div>
          <button className="button-reset" onClick={resetCanvas}>Reset Canvas</button>


        </div>



        <div className="tools-top">
          <div className="all-tools">
            <button className={`button ${activeTool === 'freehand' ? 'active' : ''}`} onClick={setFreehandMode}>
              <BiSolidPencil className="icon" />
            </button>
            <button className={`button ${activeTool === 'line' ? 'active' : ''}`} onClick={setLineMode}>
              <IoRemoveOutline className="icon" />
            </button>
            <button className={`button ${activeTool === 'rectangle' ? 'active' : ''}`} onClick={setRectangleMode}>
              <FaRegSquareFull className="icon" />
            </button>
            <button className={`button ${activeTool === 'circle' ? 'active' : ''}`} onClick={setCircleMode}>
              <GoCircle className="icon" />
            </button>
            <button className={`button ${activeTool === 'arrow' ? 'active' : ''}`} onClick={setArrowMode}>
              <FaLongArrowAltRight className="icon" />
            </button>
            <button className={`button ${activeTool === 'ellipse' ? 'active' : ''}`} onClick={setEllipseMode}>
              <TbOvalVertical className="icon" />
            </button>
            <button className={`button ${activeTool === 'eraser' ? 'active' : ''}`} onClick={setEraserMode}>
              <CiEraser className="icon" />
            </button>
            <button className={`button ${activeTool === 'undo' ? 'active' : ''}`} onClick={undo}>
              <BiUndo className="icon" />
            </button>
          </div>

        </div>

        <div className="canvas">
          <canvas
            onMouseDown={startDrawing}
            onMouseUp={finishDrawing}
            onMouseMove={draw}
            ref={canvasRef}
          />
        </div>
      </div>
    </>
  );
}

export default App;
