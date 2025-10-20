import type { ReactNode } from "react";
import { ThemeProvider } from "styled-components";
import {
  theme,
  Wrapper,
  NavContainer,
  NavLinks,
  StyledLink,
} from "../assets/styles/theme";
import { GlobalStyles } from "../assets/styles/globalStyles";

export const Layout = ({ children }: { children: ReactNode }) => (
  <ThemeProvider theme={theme}>
    <GlobalStyles />
    <Wrapper>
      <NavContainer>
        <NavLinks>
          <StyledLink to="/">Projects</StyledLink>
          <StyledLink to="/deleted">Deleted</StyledLink>
        </NavLinks>
      </NavContainer>
      {children}
    </Wrapper>
  </ThemeProvider>
);
