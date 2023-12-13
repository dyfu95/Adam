import styled from 'styled-components'

/**
 * @typedef {string} Width
 * @typedef {string} Height
 * @typedef {string} Margin
 *
 *
 * @typedef {Object} Rwd
 * @property {{width: Width, height: Height, margin: Margin}} rwd.mobile
 * @property {{width: Width, height: Height, margin: Margin}} rwd.tablet
 * @property {{width: Width, height: Height, margin: Margin}} rwd.desktop
 */

const Container = styled.div`
  position: relative;
  min-width: ${
    /** @param {{rwd: Rwd}} props*/
    ({ rwd }) => rwd.mobile.width
  };
  min-height: ${({ rwd }) => rwd.mobile.height};
  margin: ${({ rwd }) => rwd.mobile.margin};
  ${({ theme }) => theme.breakpoint.md} {
    min-width: ${
      /** @param {{rwd: Rwd}} props*/
      ({ rwd }) => rwd.tablet.width
    };
    min-height: ${({ rwd }) => rwd.tablet.height};
    margin: ${({ rwd }) => rwd.tablet.margin};
  }

  ${({ theme }) => theme.breakpoint.xl} {
    min-width: ${({ rwd }) => rwd.desktop.width};
    min-height: ${({ rwd }) => rwd.desktop.height};
    margin: ${({ rwd }) => rwd.desktop.margin};
  }
`
const ContainerMobileAndTablet = styled(Container)`
  display: block;
  ${({ theme }) => theme.breakpoint.xl} {
    display: none;
  }
`
const ContainerDesktop = styled(Container)`
  display: none;
  ${({ theme }) => theme.breakpoint.xl} {
    display: block;
  }
`

const PlaceHolder = styled.p`
  background: #f4f5f6;
  position: absolute;
  top: 0;
  left: 50%;
  width: 100vw;
  height: 100%;
  transform: translate(-50%, 0);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #d2d2d2;
  font-feature-settings: 'clig' off, 'liga' off;
  font-size: 16px;
  font-weight: 500;
  line-height: normal;
`

const DEFAULT_SIZES = {
  mobile: {
    width: '300px',
    height: '250px',
    margin: '20px auto 0px',
  },
  tablet: {
    width: '300px',
    height: '250px',
    margin: '20px auto 0px',
  },
  desktop: {
    width: '970px',
    height: '250px',
    margin: '20px auto 0px',
  },
}

/**
 *
 * @param {Object} props
 * @param {Rwd} [props.rwd]
 * @param {JSX.Element} props.children
 * @param {boolean} [props.showPlaceHolder]
 * @returns {JSX.Element}
 */
export default function GPT_Placeholder({
  rwd = DEFAULT_SIZES,
  children,
  showPlaceHolder,
}) {
  return (
    <Container rwd={rwd}>
      {showPlaceHolder && <PlaceHolder>廣告</PlaceHolder>}
      {children}
    </Container>
  )
}
/**
 *
 * @param {Object} props
 * @param {Rwd} [props.rwd]
 * @param {JSX.Element} props.children
 * @returns
 */
const GPT_Placeholder_MobileAndTablet = ({ rwd = DEFAULT_SIZES, children }) => {
  return (
    <ContainerMobileAndTablet rwd={rwd}>{children}</ContainerMobileAndTablet>
  )
}
const GPT_Placeholder_Desktop = ({ rwd = DEFAULT_SIZES, children }) => {
  return <ContainerDesktop rwd={rwd}>{children}</ContainerDesktop>
}

export { GPT_Placeholder_MobileAndTablet, GPT_Placeholder_Desktop }
