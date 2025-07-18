'use client';
import { useState } from 'react';
import Image from 'next/image';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';


const Footer = () => {
    const [showPolicies, setShowPolicies] = useState(false);
    const [showCustomerCare, setShowCustomerCare] = useState(false);
    const [showServices, setShowServices] = useState(false);

    return (
        <footer className="bg-[#f8f8f8] text-[#222] py-10 px-4">

            {/* PC FOOTER */}
            <div className="hidden md:block">
                {/* Top Row */}
                <div className="max-w-[1300px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-sm border-b border-[#c5c5c5] pb-8 items-center mt-20">
                    {/* Policies */}
                    <div className="flex flex-col items-center">
                        <div className="text-left">
                            <p className="mb-3 myfp">Policies</p>
                            <ul className="space-y-2">
                                <li><a href="/privacy" className="colorp">Privacy Policy</a></li>
                                <li><a href="/term" className="colorp">Terms of Service</a></li>
                            </ul>
                        </div>
                    </div>

                    {/* Customer Care */}
                    <div className="flex flex-col items-center">
                        <div className="text-left">
                            <p className="myfp mb-3">Customer Care</p>
                            <ul className="space-y-2">
                                <li><a href="/contact" className="colorp">Contact us</a></li>
                            </ul>
                        </div>
                    </div>

                    {/* Services */}
                    <div className="flex flex-col items-center">
                        <div className="text-left">
                            <p className="myfp mb-3">Services</p>
                            <ul className="space-y-2">
                                <li><a href="/services" className="colorp">Services</a></li>
                                <li><a href="/ext" className="colorp">Extensions</a></li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Middle Row */}
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 items-center   mb-10">
                    <div></div>
                    <div className="flex justify-center">
                        <img src="https://res.cloudinary.com/dtjcqfoxc/image/upload/v1751030325/black_bgez4v.webp" alt="Logo" width={70} />
                    </div>
                    <div className="flex justify-center md:justify-end gap-5">
                        <a href='https://www.instagram.com/rafidaham_hairdressing' className='colorp'>Instagram</a>
                        <a href='https://www.facebook.com/1raffidahamhairdressing/' className='colorp'>Facebook</a>
                        <a href='https://wa.me/96178808100' className='colorp'>WhatsApp</a>
                        <a href='https://lb.linkedin.com/in/rafi-daham-aa74a492https://www.tiktok.com/@rafidaham_hairdressing' className='colorp'>Linkedin</a>
                    </div>
                </div>

                <hr id='myhrbar' className="my-4" />

                {/* Bottom Row */}
                <div className="text-center mt-20 mb-20">
                    <p className="text-sm uppercase">Rafi Daham 2025 ALL RIGHTS RESERVED</p>
                </div>
            </div>
















            {/* MOBILE FOOTER */}
            <div id='mymobfoot' className="block md:hidden text-sm space-y-6 mt-20 mb-20">
                {/* Reusable toggle section */}
                {[
                    {
                        label: 'Policies',
                        isOpen: showPolicies,
                        setOpen: setShowPolicies,
                        items: [
                            { href: '/privacy', text: 'Privacy Policy' },
                            { href: '/term', text: 'Terms of Service' },
                        ],
                    },
                    {
                        label: 'Customer Care',
                        isOpen: showCustomerCare,
                        setOpen: setShowCustomerCare,
                        items: [
                            { href: '/contact', text: 'Contact Us' },
                        ],
                    },
                    {
                        label: 'Services',
                        isOpen: showServices,
                        setOpen: setShowServices,
                        items: [
                            { href: '/services', text: 'Services' },
                            { href: '/ext', text: 'Extensions' },
                        ],
                    },
                ].map(({ label, isOpen, setOpen, items }, index) => (
                    <div key={index}>
                        <div
                            className="flex justify-between items-center cursor-pointer"
                            onClick={() => setOpen(!isOpen)}
                        >
                            <p className="myfp">{label}</p>
                            <div
                                className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'
                                    }`}
                            >
                                <FaChevronDown />
                            </div>
                        </div>
                        <div
                            className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                                }`}
                        >
                            <ul className="mt-2 space-y-2 ">
                                {items.map((item, i) => (
                                    <li key={i}>
                                        <a href={item.href} className="colorp">
                                            {item.text}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                          <hr id='myhrbar1' className="my-4" />
                    </div>
                ))}

                {/* Social Links */}
                <div className="flex flex-wrap justify-center gap-3 pt-2">
                    <a href="https://www.instagram.com/rafidaham_hairdressing" className="colorp">Instagram</a>
                    <a href="https://www.facebook.com/1raffidahamhairdressing/" className="colorp">Facebook</a>
                    <a href="https://wa.me/96178808100" className="colorp">WhatsApp</a>
                    <a href="https://lb.linkedin.com/in/rafi-daham-aa74a492https://www.tiktok.com/@rafidaham_hairdressing" className="colorp">Linkedin</a>
                </div>

                 <hr id='myhrbar1' className="my-4" />

                {/* Logo */}
                <div className="flex justify-center mt-6">
                    <img src="https://res.cloudinary.com/dtjcqfoxc/image/upload/v1751030325/black_bgez4v.webp" alt="Logo" width={70} />
                </div>

                {/* Copyright */}
                <div className="text-center mt-20 mb-20">
                    <p className="text-sm uppercase">Rafi Daham 2025 ALL RIGHTS RESERVED</p>
                </div>
            </div>
















        </footer>
    );
};

export default Footer;
