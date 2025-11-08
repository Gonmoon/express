import styled from 'styled-components'

export const Card = styled.div`
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`

export const Title = styled.h3`
  margin: 0 0 10px 0;
  color: #333;
`

export const Genre = styled.p`
  color: #666;
  font-style: italic;
  margin: 0 0 10px 0;
`

export const Price = styled.div`
  color: ${props => props.theme.colors.success};
  font-weight: bold;
  font-size: 1.2em;
  margin-bottom: 15px;
`

export const Showtimes = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;

  span {
    background: ${props => props.theme.colors.primary};
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.9em;
  }
`