import { useCallback, useState } from "react";
import _ from "lodash";

function useDebounce<S>(obj: S, wait: number = 500): [S, React.Dispatch<React.SetStateAction<S>>] {
  const [state, setState] = useState<S>(obj);

  const setDebouncedState: React.Dispatch<React.SetStateAction<S>> = (val) => {
    debounce(val);
  };

  const debounce = useCallback(
    _.debounce((prop: React.SetStateAction<S>) => {
      setState(prop);
    }, wait),
    []
  );

  return [state, setDebouncedState];
}

export default useDebounce;
