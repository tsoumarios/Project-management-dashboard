import "styled-components";

declare module "styled-components" {
  export interface DefaultTheme {
    colors: {
      primary: string;
      black: string;
      white: string;
      gray: string;
      green: string;
      red: string;
    };
    spacing: (v: number) => string;
    radius: string;
  }
}
