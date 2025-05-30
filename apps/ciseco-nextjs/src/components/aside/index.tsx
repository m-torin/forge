import { Aside as AsideComponent, AsideProvider, useAside } from './aside'

type AsideType = typeof AsideComponent & {
  Provider: typeof AsideProvider
}

const Aside = AsideComponent as AsideType
Aside.Provider = AsideProvider

export { useAside }
export default Aside
