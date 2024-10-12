declare module "*.svg?react" {
  import { ComponentProps, FunctionComponent } from "react";

  export const ReactComponent: FunctionComponent<
    ComponentProps<"svg"> & { title?: string }
  >;
  export default ReactComponent;
}
