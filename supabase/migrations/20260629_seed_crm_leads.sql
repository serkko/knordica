-- Seed Data: 20 Clientes Mocks para el CRM
-- Fecha: 2026-06-29
-- Asocia los leads al agente actual o al primer agente disponible en la DB.

DO $$
DECLARE
    v_agent_id UUID;
BEGIN
    -- Intentar obtener el ID del agente principal
    SELECT id INTO v_agent_id FROM agents WHERE email = 'zsoftuser@gmail.com';
    
    -- Si no existe, usar el primer agente disponible
    IF v_agent_id IS NULL THEN
        SELECT id INTO v_agent_id FROM agents LIMIT 1;
    END IF;
    
    -- Si sigue siendo nulo (no hay agentes), crear un ID temporal o usar el seeded
    IF v_agent_id IS NULL THEN
        v_agent_id := '1f84e2be-80d4-48f8-b391-7db1387d8541';
    END IF;

    -- Insertar los 20 mocks lógicos
    INSERT INTO leads (
        id, agent_id, full_name, email, phone, whatsapp, client_type, status,
        budget_min, budget_max, budget_currency, interested_zones, interested_types,
        notes, next_action, next_action_date, last_contact, created_at, updated_at
    ) VALUES
    (
        'c1111111-1111-1111-1111-111111111111', v_agent_id, 'Alejandra Rivas', 
        'arivas@email.com', '+58 412 1234567', '+58 412 1234567', 'comprador', 'nuevo',
        100000, 150000, 'USD', ARRAY['libertador'], ARRAY['apartamento'],
        'Busca apartamento de 2 habitaciones, planta baja indispensable por razones familiares.',
        'Enviar portafolio de apartamentos en La Pedregosa', '2026-06-30', '2026-06-28',
        NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'
    ),
    (
        'c2222222-2222-2222-2222-222222222222', v_agent_id, 'Francisco Pernía', 
        'fpernia@email.com', '+58 414 7654321', '+58 414 7654321', 'inversor', 'contactado',
        200000, 300000, 'USD', ARRAY['libertador', 'campo_elias'], ARRAY['local', 'edificio'],
        'Interesado en inmuebles comerciales con alto retorno de alquiler.',
        'Llamada de seguimiento para coordinar visita a terreno comercial', '2026-06-23', '2026-06-20',
        NOW() - INTERVAL '10 days', NOW() - INTERVAL '9 days'
    ),
    (
        'c3333333-3333-3333-3333-333333333333', v_agent_id, 'María Gabriela Soto', 
        'mgsoto@email.com', '+58 416 9876543', NULL, 'arrendatario', 'visita',
        500, 800, 'USD', ARRAY['libertador'], ARRAY['casa'],
        'Alquiler vacacional o de larga estancia para profesor universitario visitante.',
        'Visita programada a casa Chorros de Milla', '2026-07-02', '2026-06-25',
        NOW() - INTERVAL '14 days', NOW() - INTERVAL '4 days'
    ),
    (
        'c4444444-4444-4444-4444-444444444444', v_agent_id, 'Carlos Eduardo Mendoza', 
        'cemendoza@email.com', '+58 424 5556677', '+58 424 5556677', 'comprador', 'negociacion',
        150000, 180000, 'USD', ARRAY['campo_elias'], ARRAY['townhouse'],
        'Tiene oferta en discusión para townhouse en San Juan. Revisar contra-oferta.',
        'Presentar contra-oferta firmada por el propietario', '2026-06-29', '2026-06-28',
        NOW() - INTERVAL '20 days', NOW() - INTERVAL '1 day'
    ),
    (
        'c5555555-5555-5555-5555-555555555555', v_agent_id, 'Beatriz Elena Araujo', 
        'baraujo@email.com', '+58 412 8889900', NULL, 'propietario', 'nuevo',
        NULL, 120000, 'USD', ARRAY['libertador'], ARRAY['apartamento'],
        'Desea vender apartamento en Las Américas para comprar casa más amplia.',
        'Coordinar avalúo y sesión fotográfica del inmueble', '2026-07-03', '2026-06-29',
        NOW(), NOW()
    ),
    (
        'c6666666-6666-6666-6666-666666666666', v_agent_id, 'José Manuel Gil', 
        'jmgil@email.com', '+58 414 4443322', '+58 414 4443322', 'inversor', 'visita',
        80000, 110000, 'USD', ARRAY['libertador'], ARRAY['apartamento', 'oficina'],
        'Busca oficinas céntricas para remodelar y alquilar a empresas de tecnología.',
        'Mostrar oficinas en el Centro Profesional Américas', '2026-07-01', '2026-06-27',
        NOW() - INTERVAL '7 days', NOW() - INTERVAL '2 days'
    ),
    (
        'c7777777-7777-7777-7777-777777777777', v_agent_id, 'Diana Carolina Uzcátegui', 
        'dcuzcategui@email.com', '+58 416 1112233', '+58 416 1112233', 'arrendatario', 'contactado',
        300, 450, 'USD', ARRAY['libertador'], ARRAY['apartamento'],
        'Estudiante de postgrado ULA busca apartamento amoblado cerca de medicina.',
        'Enviar opciones de anexos amoblados en Chorros de Milla', '2026-06-30', '2026-06-28',
        NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 day'
    ),
    (
        'c8888888-8888-8888-8888-888888888888', v_agent_id, 'Humberto Plaza', 
        'hplaza@email.com', '+58 424 9998877', NULL, 'comprador', 'cerrado',
        130000, 130000, 'USD', ARRAY['santos_marquina'], ARRAY['casa'],
        'Cerrada compra de casa campestre en Tabay. Entrega de llaves completada.',
        'Hacer llamada de cortesía post-venta', '2026-07-10', '2026-06-25',
        NOW() - INTERVAL '45 days', NOW() - INTERVAL '4 days'
    ),
    (
        'c9999999-9999-9999-9999-999999999999', v_agent_id, 'Ricardo Montilla', 
        'rmontilla@email.com', '+58 412 7776655', '+58 412 7776655', 'propietario', 'nuevo',
        NULL, NULL, 'USD', ARRAY['sucre'], ARRAY['terreno_lote'],
        'Quiere listar terreno en Lagunillas de 5000 metros con factibilidad de agua.',
        'Verificar linderos y documentos de registro catastral', '2026-07-04', '2026-06-29',
        NOW(), NOW()
    ),
    (
        'ca101010-1010-1010-1010-101010101010', v_agent_id, 'Gabriela Alejandra Altuve', 
        'galtuve@email.com', '+58 414 3332211', '+58 414 3332211', 'comprador', 'negociacion',
        95000, 110000, 'USD', ARRAY['libertador'], ARRAY['apartamento'],
        'Presentó oferta formal por apartamento en Residencias El Rodeo. Esperando firma.',
        'Llamar al vendedor para firmar aceptación de oferta', '2026-06-29', '2026-06-28',
        NOW() - INTERVAL '28 days', NOW() - INTERVAL '1 day'
    ),
    (
        'ca111111-1111-1111-1111-111111111111', v_agent_id, 'Luis Alfonso Dávila', 
        'ldavila@email.com', '+58 424 1110099', NULL, 'inversor', 'contactado',
        350000, 500000, 'USD', ARRAY['libertador'], ARRAY['edificio', 'galpon'],
        'Busca galpón grande o edificio comercial en Av. Los Próceres.',
        'Contactar a colega inmobiliario por galpón no listado', '2026-07-02', '2026-06-26',
        NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days'
    ),
    (
        'ca121212-1212-1212-1212-121212121212', v_agent_id, 'Valeria Valentina Valero', 
        'vvalero@email.com', '+58 416 8887766', '+58 416 8887766', 'arrendatario', 'visita',
        600, 1000, 'USD', ARRAY['libertador'], ARRAY['casa', 'townhouse'],
        'Familia busca casa en alquiler con jardín amplio y vigilancia privada.',
        'Visita a townhouse en conjunto exclusivo de La Pedregosa', '2026-06-27', '2026-06-24',
        NOW() - INTERVAL '9 days', NOW() - INTERVAL '5 days'
    ),
    (
        'ca131313-1313-1313-1313-131313131313', v_agent_id, 'Juan Ignacio Guerrero', 
        'jguerrero@email.com', '+58 412 4445566', '+58 412 4445566', 'comprador', 'perdido',
        70000, 85000, 'USD', ARRAY['campo_elias'], ARRAY['apartamento'],
        'Desistió de la búsqueda temporalmente por reubicación laboral fuera del país.',
        'Archivar contacto', NULL, '2026-06-15',
        NOW() - INTERVAL '40 days', NOW() - INTERVAL '14 days'
    ),
    (
        'ca141414-1414-1414-1414-141414141414', v_agent_id, 'Yolanda María Maldonado', 
        'ymaldonado@email.com', '+58 414 1122334', '+58 414 1122334', 'propietario', 'contactado',
        NULL, NULL, 'USD', ARRAY['libertador'], ARRAY['casa'],
        'Desea alquilar casa amplia en Santa María. Falta firmar contrato de corretaje.',
        'Enviar borrador del contrato de corretaje exclusivo', '2026-06-29', '2026-06-28',
        NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'
    ),
    (
        'ca151515-1515-1515-1515-151515151515', v_agent_id, 'Santiago Rojas', 
        'srojas@email.com', '+58 424 8881122', '+58 424 8881122', 'comprador', 'nuevo',
        50000, 70000, 'USD', ARRAY['campo_elias', 'sucre'], ARRAY['apartamento', 'casa'],
        'Pareja joven con crédito propio aprobado busca su primer hogar.',
        'Primer contacto telefónico para validar preferencias', '2026-06-29', '2026-06-29',
        NOW(), NOW()
    ),
    (
        'ca161616-1616-1616-1616-161616161616', v_agent_id, 'Elena María Paredes', 
        'eparedes@email.com', '+58 416 5554433', NULL, 'arrendatario', 'cerrado',
        400, 500, 'USD', ARRAY['libertador'], ARRAY['apartamento'],
        'Alquiler concretado de apartamento de 2 hab en Av. Las Américas por 1 año.',
        'Revisar fecha de primer mes de canon', '2026-07-20', '2026-06-20',
        NOW() - INTERVAL '19 days', NOW() - INTERVAL '9 days'
    ),
    (
        'ca171717-1717-1717-1717-171717171717', v_agent_id, 'Gustavo Adolfo Rangel', 
        'grangel@email.com', '+58 412 1115599', '+58 412 1115599', 'inversor', 'negociacion',
        150000, 200000, 'USD', ARRAY['libertador', 'rangel'], ARRAY['terreno_lote', 'hacienda_finca'],
        'En negociación de compra de lote de terreno agrícola en Mucuchíes.',
        'Esperar borrador del documento final de compra-venta visado', '2026-07-02', '2026-06-28',
        NOW() - INTERVAL '24 days', NOW() - INTERVAL '1 day'
    ),
    (
        'ca181818-1818-1818-1818-181818181818', v_agent_id, 'Camila Sofía Briceño', 
        'cbriceno@email.com', '+58 424 7771122', '+58 424 7771122', 'comprador', 'visita',
        120000, 160000, 'USD', ARRAY['libertador'], ARRAY['apartamento'],
        'Mostrado apartamento en Residencias La Pedregosa, le encantó la vista.',
        'Seguimiento para recibir propuesta formal por escrito', '2026-06-29', '2026-06-27',
        NOW() - INTERVAL '5 days', NOW() - INTERVAL '2 days'
    ),
    (
        'ca191919-1919-1919-1919-191919191919', v_agent_id, 'Pedro Pablo Chacón', 
        'ppchacon@email.com', '+58 414 9990011', NULL, 'propietario', 'visita',
        NULL, NULL, 'USD', ARRAY['libertador'], ARRAY['oficina'],
        'Propietario de oficina en el Centro Profesional. Coordinando visitas con interesados.',
        'Acompañar visita con el cliente inversor Gil', '2026-07-01', '2026-06-28',
        NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 day'
    ),
    (
        'ca202020-2020-2020-2020-202020202020', v_agent_id, 'Estefanía Carolina Rondón', 
        'erondon@email.com', '+58 416 3335577', '+58 416 3335577', 'arrendatario', 'nuevo',
        200, 300, 'USD', ARRAY['libertador'], ARRAY['habitacion', 'anexo'],
        'Busca anexo independiente en zona norte de Mérida.',
        'Validar disponibilidad de anexo en Milla', '2026-06-30', '2026-06-29',
        NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        agent_id = EXCLUDED.agent_id,
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        whatsapp = EXCLUDED.whatsapp,
        client_type = EXCLUDED.client_type,
        status = EXCLUDED.status,
        budget_min = EXCLUDED.budget_min,
        budget_max = EXCLUDED.budget_max,
        budget_currency = EXCLUDED.budget_currency,
        interested_zones = EXCLUDED.interested_zones,
        interested_types = EXCLUDED.interested_types,
        notes = EXCLUDED.notes,
        next_action = EXCLUDED.next_action,
        next_action_date = EXCLUDED.next_action_date,
        last_contact = EXCLUDED.last_contact,
        updated_at = EXCLUDED.updated_at;
END $$;
