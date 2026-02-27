import type { Config } from "jest";

const config: Config = {
  testEnvironment: "jsdom",

  testMatch: ["<rootDir>/src/testCases/**/*.test.tsx"],

  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: "<rootDir>/tsconfig.json",
        isolatedModules: true,
      },
    ],
  },

  moduleFileExtensions: ["ts", "tsx", "js"],

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.(css|scss|sass)$": "identity-obj-proxy",
  },

  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
};

export default config;
