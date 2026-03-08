import nextConfig from "eslint-config-next";

const eslintConfig = [
  ...nextConfig,
  {
    ignores: ["node_modules/**"],
  },
  {
    rules: {
      // Data-fetching in useEffect is a standard React pattern.
      // This rule is overly strict for async data loading.
      "react-hooks/set-state-in-effect": "off",
    },
  },
];

export default eslintConfig;
