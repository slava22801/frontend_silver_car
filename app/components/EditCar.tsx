import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';

interface Car {
  id: number;
  name: string;
  price: number;
  mileage: number;
  engine: string;
  transmition_box: string;
  gear: string;
  rudder: string;
  carcase: string;
  color: string;
  photo_url?: string;
  photo_path?: string;
}

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

const EditCar: React.FC = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [selectedCarId, setSelectedCarId] = useState<number | null>(null);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue
  } = useForm<CarForm>();

  const imageFile = watch('image');

  // Загрузка списка автомобилей
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8001/cars');
        if (response.ok) {
          const data = await response.json();
          setCars(data);
        }
      } catch (error) {
        console.error('Ошибка загрузки автомобилей:', error);
      }
    };
    fetchCars();
  }, []);

  // Загрузка данных выбранного автомобиля
  useEffect(() => {
    if (selectedCarId) {
      const car = cars.find(c => c.id === selectedCarId);
      if (car) {
        setSelectedCar(car);
        setValue('name', car.name);
        setValue('price', car.price);
        setValue('mileage', car.mileage);
        setValue('engine', car.engine);
        setValue('transmition_box', car.transmition_box);
        setValue('gear', car.gear);
        setValue('rudder', car.rudder);
        setValue('carcase', car.carcase);
        setValue('color', car.color);
        
        // Установка предпросмотра изображения
        if (car.photo_url) {
          setPreviewImage(car.photo_url);
        } else if (car.photo_path) {
          setPreviewImage(`http://127.0.0.1:8001${car.photo_path}`);
        }
      }
    }
  }, [selectedCarId, cars, setValue]);

  // Обработка изменения файла
  useEffect(() => {
    if (imageFile && imageFile.length > 0) {
      const file = imageFile[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  }, [imageFile]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0 && files[0].type.startsWith('image/')) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(files[0]);
      if (fileInputRef.current) {
        fileInputRef.current.files = dataTransfer.files;
        const event = new Event('change', { bubbles: true });
        fileInputRef.current.dispatchEvent(event);
      }
    }
  };

  const onSubmit = async (data: CarForm) => {
    if (!selectedCarId) {
      alert('Выберите автомобиль для редактирования');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('price', data.price.toString());
      formData.append('mileage', data.mileage.toString());
      formData.append('engine', data.engine);
      formData.append('transmition_box', data.transmition_box);
      formData.append('gear', data.gear);
      formData.append('rudder', data.rudder);
      formData.append('carcase', data.carcase);
      formData.append('color', data.color);
      
      if (data.image && data.image.length > 0) {
        formData.append('photo', data.image[0]);
      }
      
      const response = await fetch(`http://127.0.0.1:8001/admin/edit_car/${selectedCarId}`, {
        method: 'PUT',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Ошибка при редактировании автомобиля');
      }
      
      const responseData = await response.json();
      alert(responseData.message || 'Автомобиль успешно отредактирован!');
      
      // Обновляем список автомобилей
      const carsResponse = await fetch('http://127.0.0.1:8001/cars');
      if (carsResponse.ok) {
        const updatedCars = await carsResponse.json();
        setCars(updatedCars);
      }
    } catch (error) {
      console.error('Error details:', error);
      const message = error instanceof Error ? error.message : 'Ошибка при редактировании автомобиля';
      alert(message);
    }
  };

  const { ref, ...imageRegister } = register('image', {
    validate: {
      fileType: (files) => {
        if (files && files.length > 0) {
          const file = files[0];
          if (!file.type.startsWith('image/')) {
            return 'Файл должен быть изображением';
          }
        }
        return true;
      },
      fileSize: (files) => {
        if (files && files.length > 0) {
          const file = files[0];
          const maxSize = 5 * 1024 * 1024;
          if (file.size > maxSize) {
            return 'Размер файла не должен превышать 5MB';
          }
        }
        return true;
      }
    }
  });

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-white">Редактировать автомобиль</h2>
      
      <div className="mb-6">
        <label className="block mb-2 font-bold text-white">Выберите автомобиль:</label>
        <select
          value={selectedCarId || ''}
          onChange={(e) => setSelectedCarId(Number(e.target.value))}
          className="w-full max-w-md p-2 border border-gray-300 rounded-lg"
        >
          <option value="">-- Выберите автомобиль --</option>
          {cars.map((car) => (
            <option key={car.id} value={car.id}>
              {car.name} - {car.price}₽
            </option>
          ))}
        </select>
      </div>

      {selectedCar && (
        <form onSubmit={handleSubmit(onSubmit)} style={{ maxWidth: '500px' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: 'white' }}>
              Фотография автомобиля
            </label>
            
            <div 
              onClick={handleImageClick}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              style={{
                border: '2px dashed #ddd',
                padding: '20px',
                textAlign: 'center',
                borderRadius: '8px',
                backgroundColor: previewImage ? '#f9f9f9' : '#fff',
                cursor: 'pointer',
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                transition: 'border-color 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#007bff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#ddd';
              }}
            >
              <input
                type="file"
                accept="image/*"
                {...imageRegister}
                style={{ display: 'none' }}
                ref={(e) => {
                  ref(e);
                  fileInputRef.current = e;
                }}
              />
              
              {previewImage ? (
                <div style={{ width: '100%', position: 'relative' }}>
                  <img 
                    src={previewImage} 
                    alt="Предпросмотр" 
                    style={{
                      maxWidth: '100%',
                      maxHeight: '300px',
                      borderRadius: '8px',
                      objectFit: 'contain'
                    }}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewImage(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      backgroundColor: 'rgba(255, 0, 0, 0.7)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '30px',
                      height: '30px',
                      cursor: 'pointer',
                      fontSize: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: '48px', marginBottom: '10px' }}>📷</div>
                  <div style={{ color: '#666', marginBottom: '5px' }}>
                    Нажмите для загрузки или перетащите изображение сюда
                  </div>
                  <div style={{ color: '#999', fontSize: '12px' }}>
                    Поддерживаются форматы: JPG, PNG, GIF (макс. 5MB)
                  </div>
                </>
              )}
            </div>
            {errors.image && (
              <div style={{ color: 'red', marginTop: '5px', fontSize: '14px' }}>
                {errors.image.message}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ color: 'white' }}>Car Name:</label>
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
            <label style={{ color: 'white' }}>Price:</label>
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
            <label style={{ color: 'white' }}>Mileage:</label>
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
            <label style={{ color: 'white' }}>Engine:</label>
            <input
              type="text"
              {...register('engine', { required: 'Engine is required' })}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
            {errors.engine && <span style={{ color: 'red' }}>{errors.engine.message}</span>}
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ color: 'white' }}>Transmission Box:</label>
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
            <label style={{ color: 'white' }}>Gear Type:</label>
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
            <label style={{ color: 'white' }}>Руль:</label>
            <select
              {...register('rudder', { required: 'Rudder is required' })}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            >
              <option value="">Выберите руль</option>
              <option value="left">Левый</option>
              <option value="right">Правый</option>
            </select>
            {errors.rudder && <span style={{ color: 'red' }}>{errors.rudder.message}</span>}
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ color: 'white' }}>Кузов:</label>
            <select
              {...register('carcase', { required: 'Carcase is required' })}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            >
              <option value="">Выберите кузов</option>
              <option value="sedan">Седан</option>
              <option value="hatchback">Хэтчбек</option>
              <option value="suv">Внедорожник</option>
              <option value="coupe">Купе</option>
              <option value="wagon">Универсал</option>
            </select>
            {errors.carcase && <span style={{ color: 'red' }}>{errors.carcase.message}</span>}
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ color: 'white' }}>Цвет:</label>
            <input
              type="text"
              {...register('color', { required: 'Color is required' })}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
            {errors.color && <span style={{ color: 'red' }}>{errors.color.message}</span>}
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
            {isSubmitting ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
        </form>
      )}
    </div>
  );
};

export default EditCar;

