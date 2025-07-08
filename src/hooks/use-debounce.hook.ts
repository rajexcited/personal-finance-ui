import { useCallback, useState } from "react";
import _ from "lodash";

function useDebounce<S>(
  obj: S,
  wait: number = 500,
  waitAlternatively?: boolean
): [S, React.Dispatch<React.SetStateAction<S>>] {
  if (wait < 0) throw Error("wait cannot be negative");

  const [state, setState] = useState<{ obj: S; wait: number }>({ obj, wait });

  const setDebouncedState: React.Dispatch<React.SetStateAction<S>> = (val) => {
    if (state.wait < 0) updateObjState(val);
    else debounce(val);
  };

  const updateObjState = (prop: React.SetStateAction<S>) => {
    setState((prev) => {
      let newObj = prop as S;
      if (prop instanceof Function) {
        newObj = prop(prev.obj);
      }
      const newWait = !waitAlternatively || prev.wait < 0 ? wait : -1;
      return { obj: newObj, wait: newWait };
    });
  };

  const debounce = useCallback(_.debounce(updateObjState, wait), []);

  return [state.obj, setDebouncedState];
}

export default useDebounce;
