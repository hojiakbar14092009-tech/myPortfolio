// Loaded only by the case-study chunk: pinned scenes and scrubbed sequences.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { onSmoothScroll } from './smooth';

gsap.registerPlugin(ScrollTrigger);
onSmoothScroll(ScrollTrigger.update);

export { gsap, ScrollTrigger };
