import styled from 'styled-components'

const Wrapper = styled.div``
const Title = styled.h2`
  color: rgba(0, 0, 0, 0.87);
  font-size: 24px;
  font-weight: 500;
`

export default function Recipient() {
  return (
    <Wrapper>
      <Title>收件人</Title>
    </Wrapper>
  )
}