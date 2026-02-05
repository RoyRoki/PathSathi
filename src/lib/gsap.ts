'use client'

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { useGSAP } from '@gsap/react'

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, useGSAP)
}

export { gsap, ScrollTrigger, ScrollToPlugin, useGSAP }

// Reusable animation configurations
export const animations = {
    fadeInUp: {
        y: 80,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
    },
    fadeIn: {
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
    },
    scaleIn: {
        scale: 0.9,
        opacity: 0,
        duration: 0.7,
        ease: 'back.out(1.7)',
    },
    slideInLeft: {
        x: -100,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
    },
    slideInRight: {
        x: 100,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
    },
}

// Character reveal animation helper
export const splitTextReveal = (element: HTMLElement, delay = 0) => {
    const text = element.textContent || ''
    element.innerHTML = text
        .split('')
        .map((char) => {
            if (char === ' ') return ' '
            return `<span class="inline-block" style="opacity: 0; transform: translateY(20px)">${char}</span>`
        })
        .join('')

    const chars = element.querySelectorAll('span')

    gsap.to(chars, {
        y: 0,
        opacity: 1,
        stagger: 0.03,
        duration: 0.5,
        ease: 'power3.out',
        delay,
    })
}
