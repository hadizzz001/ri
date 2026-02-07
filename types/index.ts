import { MouseEventHandler } from "react";

export interface CustomButtonProps {
    title: string;
    containerStyles ?: string;
    handleClick ?: MouseEventHandler<HTMLButtonElement>;
    btnType?: "button" | "submit"
}


export interface TempProps{ 
    _id: string;
    title:string;
    category:string;
    price:string|number;
    discount:string|number;
    img: string[];
    type?: "single" | "collection";
    stock?: string|number;
    color?: Array<{
        name?: string;
        qty?: string|number;
        sizes?: Array<{
            size: string;
            qty: string|number;
        }>;
    }>;
}

export interface TempProps1{ 
    id: string;
    name:string; 
}

export interface TempProps2{ 
    _id: string;
    name:string;  
    img: string;
}
 