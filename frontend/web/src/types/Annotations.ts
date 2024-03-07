export type Annotation = {
    id: number;
    image_id: number;
    category_id: number;
    area: number;
    bbox: [number, number, number, number];
    segmentation: number[];
    is_crowd: boolean;
};

export type Category = {
    id: number;
    name: string;
    supercategory: string;
};

export type Image = {
    id: number;
    file_name: string;
    width: number;
    height: number;
};
