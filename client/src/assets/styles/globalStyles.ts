import { createGlobalStyle } from "styled-components";

export const GlobalStyles = createGlobalStyle`
  body {
    margin: 0;
    background-color: #f7f7f7;
    font-family: 'Inter', sans-serif;
    color: ${({ theme }) => theme.colors.black};
  }
  * {
    box-sizing: border-box;
  }
`;
