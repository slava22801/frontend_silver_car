import React from 'react';
import { useForm } from 'react-hook-form';

interface CarForm {
  name: string;
  price: number;
  mileage: number;
  engine: string;
  transmition_box: string;
  gear: string;
  rudder: string;
  carcase: string;
  color: string;
  image?: FileList;
}

const CarFormBasic: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<CarForm>();

  const onSubmit = async (data: CarForm) => {
    try {
      console.log('Form data:', data);
      // Здесь ваш API call
      await fetch('http://localhost:8000/add_car', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      reset(); // Сброс формы после успешной отправки
      alert('Car added successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('Error adding car');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ maxWidth: '500px', margin: '20px' }}>
      <h2>Добавить новое авто</h2>

        <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Фотография автомобиля
              </label>
              
              <div style={{
                border: '2px dashed #ddd',
                padding: '20px',
                textAlign: 'center',
                borderRadius: '8px',
                backgroundColor: '#fff',
                cursor: 'pointer'
              }}>
              <input
                  type="file"
                  accept="image/*"
                  {...register('image')}
                  style={{ display: 'none' }}
                  id="image-upload"
               />
              </div>
              {errors.image && (
                <div style={{ color: 'red', marginTop: '5px', fontSize: '14px' }}>
                  {errors.image.message}
                </div>
              )}
        </div>

      
      
      <div style={{ marginBottom: '15px' }}>
        <label>Car Name:</label>
        <input
          type="text"
          {...register('name', { 
            required: 'Car name is required',
            minLength: {
              value: 2,
              message: 'Name must be at least 2 characters'
            }
          })}
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
        />
        {errors.name && <span style={{ color: 'red' }}>{errors.name.message}</span>}
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>Price:</label>
        <input
          type="number"
          {...register('price', { 
            required: 'Price is required',
            min: {
              value: 0,
              message: 'Price must be positive'
            }
          })}
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
        />
        {errors.price && <span style={{ color: 'red' }}>{errors.price.message}</span>}
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>Mileage:</label>
        <input
          type="number"
          {...register('mileage', { 
            required: 'Mileage is required',
            min: {
              value: 0,
              message: 'Mileage must be positive'
            }
          })}
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
        />
        {errors.mileage && <span style={{ color: 'red' }}>{errors.mileage.message}</span>}
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>Engine:</label>
        <input
          type="text"
          {...register('engine', { required: 'Engine is required' })}
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
        />
        {errors.engine && <span style={{ color: 'red' }}>{errors.engine.message}</span>}
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>Transmission Box:</label>
        <select
          {...register('transmition_box', { required: 'Transmission is required' })}
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
        >
          <option value="">Select transmission</option>
          <option value="manual">МКПП</option>
          <option value="automatic">АКПП</option>
          <option value="robot">Робот</option>
          <option value="variator">Вариатор</option>
        </select>
        {errors.transmition_box && (
          <span style={{ color: 'red' }}>{errors.transmition_box.message}</span>
        )}
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>Gear Type:</label>
        <select
          {...register('gear', { required: 'Gear type is required' })}
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
        >
          <option value="">Select gear type</option>
          <option value="front-wheel">Front Wheel</option>
          <option value="rear-wheel">Rear Wheel</option>
          <option value="all-wheel">All Wheel</option>
        </select>
        {errors.gear && <span style={{ color: 'red' }}>{errors.gear.message}</span>}
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <label>Руль:</label>
        <select
          {...register('rudder', { required: 'Gear type is required' })}
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
        >
          <option value="">Выберите руль</option>
          <option value="left">Левый</option>
          <option value="right">Правый</option>
        </select>
        {errors.gear && <span style={{ color: 'red' }}>{errors.gear.message}</span>}
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>Кузов:</label>
        <select
          {...register('carcase', { required: 'Gear type is required' })}
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
        >
          <option value="">Выберите кузов</option>
          <option value="front-wheel">Front Wheel</option>
          <option value="rear-wheel">Rear Wheel</option>
          <option value="all-wheel">All Wheel</option>
        </select>
        {errors.gear && <span style={{ color: 'red' }}>{errors.gear.message}</span>}
      </div>


      <div style={{ marginBottom: '15px' }}>
        <label>Цвет:</label>
        <input
          type="text"
          {...register('color', { required: 'Color is required' })}
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
        />
        {errors.engine && <span style={{ color: 'red' }}>{errors.engine.message}</span>}
      </div>

      <button 
        type="submit" 
        disabled={isSubmitting}
        style={{
          width: '100%',
          padding: '10px',
          backgroundColor: isSubmitting ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isSubmitting ? 'not-allowed' : 'pointer'
        }}
      >
        {isSubmitting ? 'Добавление авто...' : 'Добавить авто'}
      </button>
    </form>
  );
};

export default CarFormBasic;