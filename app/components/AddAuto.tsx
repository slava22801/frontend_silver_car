import React, { useState, useRef } from 'react';
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
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch
  } = useForm<CarForm>();

  const imageFile = watch('image');
  const { ref, ...imageRegister } = register('image', {
    validate: {
      required: (files) => {
        if (!files || files.length === 0) {
          return 'Фотография обязательна';
        }
        return true;
      },
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
          const maxSize = 5 * 1024 * 1024; // 5MB
          if (file.size > maxSize) {
            return 'Размер файла не должен превышать 5MB';
          }
        }
        return true;
      }
    }
  });

  // Обработка изменения файла
  React.useEffect(() => {
    if (imageFile && imageFile.length > 0) {
      const file = imageFile[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setPreviewImage(null);
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
        // Триггерим событие change для react-hook-form
        const event = new Event('change', { bubbles: true });
        fileInputRef.current.dispatchEvent(event);
      }
    }
  };

  const onSubmit = async (data: CarForm) => {
    try {
      console.log('Form data:', data);
      
      // Создаем FormData для отправки файла
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
      
      // Добавляем файл изображения (обязательное поле для сервера)
      if (data.image && data.image.length > 0) {
        formData.append('photo', data.image[0]); // Сервер ожидает поле 'photo', а не 'image'
      } else {
        throw new Error('Фотография обязательна для добавления автомобиля');
      }
      
      // Логируем содержимое FormData для отладки
      console.log('FormData contents:');
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}:`, value.name, value.type, value.size);
        } else {
          console.log(`${key}:`, value);
        }
      }
      
      // Отправляем FormData
      const response = await fetch('http://127.0.0.1:8001/admin/add_car', {
        method: 'POST',
        body: formData, // Не устанавливаем Content-Type, браузер сделает это автоматически с boundary
      });
      
      console.log('Response status:', response.status);
      console.log('Response statusText:', response.statusText);
      
      // Получаем ответ от сервера (только один раз)
      let responseData: any = null;
      const contentType = response.headers.get('content-type');
      
      try {
        if (contentType && contentType.includes('application/json')) {
          responseData = await response.json();
        } else {
          const text = await response.text();
          if (text) {
            try {
              responseData = JSON.parse(text);
            } catch {
              responseData = { message: text };
            }
          }
        }
      } catch (e) {
        console.error('Error parsing response:', e);
      }
      
      console.log('Response data:', responseData);
      
      // Обрабатываем ошибку
      if (!response.ok) {
        const errorMessage = 
          responseData?.message || 
          responseData?.error || 
          responseData?.detail ||
          `HTTP ${response.status}: ${response.statusText}` ||
          'Ошибка при добавлении автомобиля';
        console.error('Server error:', errorMessage, responseData);
        throw new Error(errorMessage);
      }
      
      // Обрабатываем успешный ответ
      const successMessage = responseData?.message || 'Автомобиль успешно добавлен!';
      console.log('Success:', successMessage, responseData);
      
      reset(); // Сброс формы после успешной отправки
      setPreviewImage(null); // Сброс предпросмотра
      alert(successMessage);
    } catch (error) {
      console.error('Error details:', error);
      let message = 'Ошибка при добавлении автомобиля';
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        message = 'Не удалось подключиться к серверу. Проверьте, что сервер запущен на http://127.0.0.1:8001';
      } else if (error instanceof Error) {
        message = error.message;
      }
      
      alert(message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ maxWidth: '500px', margin: '20px' }}>
      <h2>Добавить новое авто</h2>

        <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
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
                  id="image-upload"
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