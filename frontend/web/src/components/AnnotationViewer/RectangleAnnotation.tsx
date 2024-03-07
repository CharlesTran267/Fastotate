import { Stage, Layer, Rect, Image } from 'react-konva';
import { useState } from 'react';
import useImage from 'use-image';

export default function RectangleAnnotation() {
    const [image] = useImage('https://konvajs.org/assets/lion.png');
    const [scale, setScale] = useState(1);
    const annotations = [
        {
            id: 1,
            x: 50,
            y: 50,
            width: 100,
            height: 100,
            fill: 'rgba(255,0,0,0.5)',
        },
    ];
    return (
        <Stage scaleX={scale} scaleY={scale}>
            <Layer>
                <Image image={image} />
                {annotations.map((annotation) => {
                    return (
                        <Rect
                            x={annotation.x}
                            y={annotation.y}
                            width={annotation.width}
                            height={annotation.height}
                            fill={annotation.fill}
                            draggable
                        />
                    );
                })}
            </Layer>
        </Stage>
    );
}
