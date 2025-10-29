import { useEffect, useState } from "react";

export default function Cars() {
  interface Car {
  name: string;
  price: number;
  mileage: number;
  engine: string;
  transmition_box: string;
  gear: string;
  rudder: string;
  carcase: string;
  color: string;
}
  interface UseCarsResult {
  cars: Car[];
  loading: boolean;
  error: string | null;
  }


  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCars = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('http://127.0.0.1:8000/cars');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const carsData: Car[] = await response.json();
        console.log(carsData);
        setCars(carsData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        console.error('Error fetching cars:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);
    return <div>
        Cars
        {cars.map(car => (
        <div key={car.id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
          <h3>{car.name}</h3>
          <p>Price: ${car.price}</p>
          <p>Mileage: {car.mileage} km</p>
          <p>Engine: {car.engine}</p>
          <p>Transmission: {car.transmition_box}</p>
          <p>Gear: {car.gear}</p>
          <p>Руль: {car.rudder}</p>
          <p>Кузов: {car.carcase}</p>
          <p>Цвет: {car.color}</p>
        </div>
        ))}
    </div>
}