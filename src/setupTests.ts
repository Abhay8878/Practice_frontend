import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";

// Polyfill for react-router / jsdom
global.TextEncoder = TextEncoder as typeof global.TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;
