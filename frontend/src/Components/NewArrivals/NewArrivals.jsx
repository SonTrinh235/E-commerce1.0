import './NewArrivals.css'
import new_arrivals from '../../data/new_arrivals'
import Item from '../Item/Item'

const NewArrivals = () => {
  return (
    <div className = 'new-arrivals'>
        <h1>HÀNG MỚI VỀ</h1>
        <hr/>
        <div className='arrivals'>
            {new_arrivals.map((item,i) => {
                return <Item key={i} id ={item.id} name = {item.name} image = {item.image} new_price = {item.new_price} old_price = {item.old_price}/>
            })}
        </div>
    </div>
  )
}

export default NewArrivals