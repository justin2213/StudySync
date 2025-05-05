-- Class entry script

INSERT INTO Classes (ClassID, SemesterID, ClassName, ClassStart, ClassEnd, ClassDays)
VALUES 
    -- Semester 1
    ('7c9d4d93-b7e3-4a6b-b994-65cc5c8ac963', 'e0e1f0a3-75b5-47e1-9ad9-75cd18b599bb', 'Math 101', '13:00:00', '14:30:00', '{Monday,Wednesday,Friday}'),
    ('3d7a9bfb-8f65-4b7b-83b6-1bbf8d9ac3f4', 'e0e1f0a3-75b5-47e1-9ad9-75cd18b599bb', 'Hist 197', '14:50:00', '15:30:00', '{Tuesday,Thursday}'),
    ('d01d90f5-e88a-4f6c-828d-4a287ba5b3be', 'e0e1f0a3-75b5-47e1-9ad9-75cd18b599bb', 'Cosc 105', '16:00:00', '17:00:00', '{Tuesday,Thursday}'),
    ('41c0a0c0-61b0-4c3f-9c72-b68e9b9fcde4', 'e0e1f0a3-75b5-47e1-9ad9-75cd18b599bb', 'Hawk 100', '17:30:00', '18:20:00', '{Tuesday,Thursday}'),
    ('567d2d84-e3ae-4d29-b11e-d9a87836f317', 'e0e1f0a3-75b5-47e1-9ad9-75cd18b599bb', 'Hawk 101', '18:40:00', '19:30:00', '{Tuesday,Thursday}'),
    ('3be59058-b8b3-4a19-8d12-bf508c7d9d8f', 'e0e1f0a3-75b5-47e1-9ad9-75cd18b599bb', 'Hawk 205', '19:50:00', '20:40:00', '{Monday,Wednesday,Friday}'),

    -- Semester 2
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'b1b8cb9e-fb98-4a99-bfcf-95d2c65b5bfe', 'Math 101', '13:00:00', '14:30:00', '{Monday,Wednesday,Friday}'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'b1b8cb9e-fb98-4a99-bfcf-95d2c65b5bfe', 'Hist 197', '14:50:00', '15:30:00', '{Tuesday,Thursday}'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'b1b8cb9e-fb98-4a99-bfcf-95d2c65b5bfe', 'Cosc 105', '16:00:00', '17:00:00', '{Tuesday,Thursday}'),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'b1b8cb9e-fb98-4a99-bfcf-95d2c65b5bfe', 'Hawk 100', '17:30:00', '18:20:00', '{Tuesday,Thursday}'),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'b1b8cb9e-fb98-4a99-bfcf-95d2c65b5bfe', 'Hawk 101', '18:40:00', '19:30:00', '{Tuesday,Thursday}'),
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'b1b8cb9e-fb98-4a99-bfcf-95d2c65b5bfe', 'Hawk 205', '19:50:00', '20:40:00', '{Monday,Wednesday,Friday}'),

    -- Semester 3
    ('11111111-1111-1111-1111-111111111111', 'f3a05c0a-d717-4683-bc0b-79fc67e9ac70', 'Math 101', '13:00:00', '14:30:00', '{Monday,Wednesday,Friday}'),
    ('22222222-2222-2222-2222-222222222222', 'f3a05c0a-d717-4683-bc0b-79fc67e9ac70', 'Hist 197', '14:50:00', '15:30:00', '{Tuesday,Thursday}'),
    ('33333333-3333-3333-3333-333333333333', 'f3a05c0a-d717-4683-bc0b-79fc67e9ac70', 'Cosc 105', '16:00:00', '17:00:00', '{Tuesday,Thursday}'),
    ('44444444-4444-4444-4444-444444444444', 'f3a05c0a-d717-4683-bc0b-79fc67e9ac70', 'Hawk 100', '17:30:00', '18:20:00', '{Tuesday,Thursday}'),
    ('55555555-5555-5555-5555-555555555555', 'f3a05c0a-d717-4683-bc0b-79fc67e9ac70', 'Hawk 101', '18:40:00', '19:30:00', '{Tuesday,Thursday}'),
    ('66666666-6666-6666-6666-666666666666', 'f3a05c0a-d717-4683-bc0b-79fc67e9ac70', 'Hawk 205', '19:50:00', '20:40:00', '{Monday,Wednesday,Friday}'),

    -- Semester 4
    ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'MATH 125', '14:20:00', '15:10:00', '{Monday,Wednesday,Friday}'),
    ('cda9d01f-a222-47ac-a3d6-49728eb96b4f', '550e8400-e29b-41d4-a716-446655440001', 'HIST 197', '13:10:00', '14:00:00', '{Tuesday,Thursday}'),
    ('f1adeeff-229f-49c2-a4ff-e500abb998a2', '550e8400-e29b-41d4-a716-446655440001', 'COSC 110', '13:10:00', '14:00:00', '{Monday,Wednesday,Friday}'),
    ('a4a52482-2b25-4245-8ac3-8f31495d88c9', '550e8400-e29b-41d4-a716-446655440001', 'COSC 105', '13:10:00', '14:00:00', '{Monday,Wednesday,Friday}'),
    ('530293af-084e-426c-bf39-1aed30f82afb', '550e8400-e29b-41d4-a716-446655440001', 'CRIM 101', '13:10:00', '14:00:00', '{Tuesday,Thursday}'),
    ('530291af-084e-426c-bf39-1aed30f82afb', '550e8400-e29b-41d4-a716-446655440001', 'MUHI 101', '13:10:00', '14:00:00', '{Tuesday,Thursday}'),
    ('660e8300-e29b-41d4-a716-446655440001', '550e8400-e22b-41d4-a716-446655440001', 'MATH 125', '14:20:00', '15:10:00', '{Monday,Wednesday,Friday}'),
    ('cda9d11f-a222-47ac-a3d6-49728eb96b4f', '550e8400-e22b-41d4-a716-446655440001', 'HIST 197', '13:10:00', '14:00:00', '{Tuesday,Thursday}'),
    ('f1adedff-229f-49c2-a4ff-e500abb998a2', '550e8400-e22b-41d4-a716-446655440001', 'COSC 110', '13:10:00', '14:00:00', '{Monday,Wednesday,Friday}'),

    -- Semester 5
    ('e8161ad0-cce6-49a8-841b-8f5dd17caf9a', '550e8400-e296-41d4-a716-446655440001', 'MATH 121', '16:20:00', '17:10:00', '{Monday,Wednesday,Friday}'),
    ('b6ae8d45-413c-4ac2-9673-01d2f6df0ce5', '550e8400-e296-41d4-a716-446655440001', 'CRIM 101', '13:35:00', '14:50:00', '{Monday,Wednesday,Friday}'),
    ('55c18d50-80c4-4530-9307-a9d9861892af', '550e8400-e296-41d4-a716-446655440001', 'HNRC 101', '15:10:00', '16:25:00', '{Monday,Wednesday,Friday}'),
    ('451ef871-aaba-48ac-a147-00be20056740', '550e8400-e296-41d4-a716-446655440001', 'COSC 210', '13:10:00', '14:00:00', '{Monday,Wednesday,Friday}'),
    -- Semester 6
    ('edbe1eb7-04fa-45c2-afb8-63371f17fa44', '4522ce47-995d-487a-a402-32a6e373e7ef', 'COSC 310', '17:30:00', '18:20:00', '{Monday,Wednesday,Friday}'),
    ('18f7ae46-63fc-410e-a980-d6a1129250d0', '4522ce47-995d-487a-a402-32a6e373e7ef', 'HNRC 102', '15:10:00', '16:25:00', '{Monday,Wednesday,Friday}'),
    ('06e6ccfb-9f91-41ec-ad7e-1d9852a49ce5', '4522ce47-995d-487a-a402-32a6e373e7ef', 'CRIM 102', '16:45:00', '18:00:00', '{Monday,Wednesday,Friday}'),
    ('bab8fadb-b3b1-47ec-b80f-22575244248b', '4522ce47-995d-487a-a402-32a6e373e7ef', 'GEOG 104', '13:35:00', '14:50:00', '{Monday,Wednesday,Friday}'),
    -- Semester 7
    ('481d9f36-e286-4d07-97d4-f09040d2211e', 'a36faa15-809c-4b6f-a22a-93c0291d5788', 'COSC 405', '14:20:00', '15:10:00', '{Monday,Wednesday,Friday}'),
    ('f9baf589-07a2-4463-b0ed-b473f37c02ab', 'a36faa15-809c-4b6f-a22a-93c0291d5788', 'COSC 341', '16:20:00', '17:10:00', '{Monday,Wednesday,Friday}'),
    ('b670992f-f506-4696-b8d4-f46eca14c3c7', 'a36faa15-809c-4b6f-a22a-93c0291d5788', 'CRIM 420', '18:20:00', '19:35:00', '{Monday,Wednesday,Friday}'),
    ('393d080a-253d-41cc-a523-25b86ec9d53c', 'a36faa15-809c-4b6f-a22a-93c0291d5788', 'MATH 216', '17:30:00', '18:20:00', '{Monday,Wednesday,Friday}'),
    ('c315c5cd-29d1-404d-be47-c459536693e3', 'a36faa15-809c-4b6f-a22a-93c0291d5788', 'COSC 319', '15:10:00', '16:25:00', '{Monday,Wednesday,Friday}'),
    -- Semester 8
    ('c03a31d7-a501-40ae-952d-a00d2034df72', '0fff6189-2b0e-4af1-98fd-8fdc943bdef7', 'MATH 309', '14:20:00', '15:10:00', '{Monday,Wednesday,Friday}'),
    ('8fe3d4a3-8cdb-4ab7-84d1-d00574b625b6', '0fff6189-2b0e-4af1-98fd-8fdc943bdef7', 'CHEM 111', '13:35:00', '14:50:00', '{Monday,Wednesday,Friday}'),
    ('33623ac4-ccd9-410d-8001-ef4cf938a290', '0fff6189-2b0e-4af1-98fd-8fdc943bdef7', 'HNRC 202', '16:45:00', '18:00:00', '{Monday,Wednesday,Friday}'),
    ('0ce0f0fa-0e55-45aa-a0a8-f49c65aee088', '0fff6189-2b0e-4af1-98fd-8fdc943bdef7', 'COSC 460', '17:30:00', '18:20:00', '{Monday,Wednesday,Friday}'),
    -- Semester 9
    ('cfe4895a-d3dc-4bcd-85f8-14846d1f9810', 'b964bfde-2e7e-4ba4-a9bb-127659e3c501', 'CRIM 321', '18:20:00', '19:35:00', '{Monday,Wednesday,Friday}'),
    ('c1892ba8-31e9-41d0-a440-244d61a5321c', 'b964bfde-2e7e-4ba4-a9bb-127659e3c501', 'HNRC 201', '16:45:00', '18:00:00', '{Monday,Wednesday,Friday}'),
    ('af33f8d0-39ba-4743-ac31-4698185fb616', 'b964bfde-2e7e-4ba4-a9bb-127659e3c501', 'COSC 216', '15:10:00', '16:25:00', '{Monday,Wednesday,Friday}'),
    ('6f3e49f2-571e-4fb2-9efe-588416962e20', 'b964bfde-2e7e-4ba4-a9bb-127659e3c501', 'COSC 362', '17:30:00', '18:20:00', '{Monday,Wednesday,Friday}'),
    -- Semester 10
    ('3c220c49-c04a-4938-b65a-9183dec8a2ef', 'fe1496d7-dada-4708-84cf-8b552e38c550', 'COSC 300', '12:00:00', '13:15:00', '{Monday,Wednesday,Friday}'),
    ('235b57a5-40c6-4df5-965c-298f35d305a1', 'fe1496d7-dada-4708-84cf-8b552e38c550', 'HNRC 281', '19:55:00', '21:10:00', '{Monday,Wednesday,Friday}'),
    ('381e51ae-9796-4107-aa04-46be6e47db01', 'fe1496d7-dada-4708-84cf-8b552e38c550', 'COSC 473', '17:30:00', '18:20:00', '{Monday,Wednesday,Friday}'),
    ('134e6b26-538e-4bf2-8f3a-32219962d3bd', 'fe1496d7-dada-4708-84cf-8b552e38c550', 'COSC 365', '13:10:00', '14:00:00', '{Monday,Wednesday,Friday}'),

    -- Semester 11
    ('625c5949-8483-474a-915e-e86bbcc7321f', '130454f7-79ad-484d-8412-4eb03c759b73', 'MATH 125', '14:20:00', '15:10:00', '{Tuesday,Thursday}'),
    ('07e0941d-1681-465a-8c62-51a47da4aaab', '130454f7-79ad-484d-8412-4eb03c759b73', 'HIST 197', '13:10:00', '14:00:00', '{Tuesday,Thursday}'),
    ('af19f0e2-d952-4f06-b5f8-14f9d4d1dec8', '130454f7-79ad-484d-8412-4eb03c759b73', 'COSC 105', '16:20:00', '17:10:00', '{Monday,Wednesday,Friday}'),
    ('88d731d2-b8ae-435c-8025-7df2f93cd4bc', '130454f7-79ad-484d-8412-4eb03c759b73', 'MUHI 101', '18:20:00', '19:35:00', '{Tuesday,Thursday}'),
    ('e1fabfb4-c6d2-44a7-8f33-b83184dfc48b', '130454f7-79ad-484d-8412-4eb03c759b73', 'GEOS 101', '16:45:00', '18:00:00', '{Monday,Wednesday,Friday}'),
    -- Semester 12
    ('791b0268-374f-4be9-9fd8-356ccdd00455', '69193567-cd0c-4f8e-924b-3295b3e8e9f1', 'MATH 126', '16:20:00', '17:10:00', '{Tuesday,Thursday}'),
    ('2bccf0a5-0dc6-4b53-9e4a-865bb92e64a5', '69193567-cd0c-4f8e-924b-3295b3e8e9f1', 'CRIM 101', '13:10:00', '14:00:00', '{Monday,Wednesday,Friday}'),
    ('9c5f1320-7be9-4e3c-b30c-fb7e8819efb2', '69193567-cd0c-4f8e-924b-3295b3e8e9f1', 'ECON 143', '18:20:00', '19:35:00', '{Monday,Wednesday,Friday}'),
    ('c4aa52c6-d416-4ffd-8081-6124886a4155', '69193567-cd0c-4f8e-924b-3295b3e8e9f1', 'COSC 110', '14:20:00', '15:10:00', '{Monday,Wednesday,Friday}'),
    ('191d98b5-5800-4444-b239-dbbb659a2d45', '69193567-cd0c-4f8e-924b-3295b3e8e9f1', 'GEOG 104', '13:35:00', '14:50:00', '{Monday,Wednesday,Friday}'),
    -- Semester 13
    ('a2043f00-79ac-4aa1-902a-d0d990a64bdf', '840ebad6-4948-40f2-89e8-b16009dbbf52', 'COSC 300', '16:45:00', '18:00:00', '{Monday,Wednesday,Friday}'),
    ('804a01f1-ed3a-4b20-8932-4fa6f5a2ce17', '840ebad6-4948-40f2-89e8-b16009dbbf52', 'PHIL 101', '18:20:00', '19:35:00', '{Monday,Wednesday,Friday}'),
    ('c166a782-45b6-462f-8549-fd5aa51625c2', '840ebad6-4948-40f2-89e8-b16009dbbf52', 'CRIM 321', '15:10:00', '16:25:00', '{Tuesday,Thursday}'),
    ('e400a59c-0de5-4780-86a3-55b237f3cac1', '840ebad6-4948-40f2-89e8-b16009dbbf52', 'COSC 216', '14:20:00', '15:10:00', '{Monday,Wednesday,Friday}'),
    ('51ae388a-6d8a-427c-8304-05727fa36810', '840ebad6-4948-40f2-89e8-b16009dbbf52', 'COSC 210', '16:20:00', '17:10:00', '{Tuesday,Thursday}'),
    -- Semester 14
    ('38f9da34-d81e-4475-ab9c-7011de20c0eb', 'd8b75bd2-a07e-46e9-ae22-f84a66c35bad', 'COSC 310', '17:30:00', '18:20:00', '{Monday,Wednesday,Friday}'),
    ('fd2e536a-ea29-4898-9780-df8d3ee0040a', 'd8b75bd2-a07e-46e9-ae22-f84a66c35bad', 'MATH 309', '14:20:00', '15:10:00', '{Monday,Wednesday,Friday}'),
    ('404555b3-b251-41ba-b2e3-c6bed6261e13', 'd8b75bd2-a07e-46e9-ae22-f84a66c35bad', 'BIOL 104', '18:20:00', '19:35:00', '{Tuesday,Thursday}'),
    ('9af4ed50-1838-4a96-9579-7f638c5a0e57', 'd8b75bd2-a07e-46e9-ae22-f84a66c35bad', 'COSC 341', '15:10:00', '16:25:00', '{Tuesday,Thursday}'),
    ('54fa5f6b-5efe-4299-9c1b-d330cc644343', 'd8b75bd2-a07e-46e9-ae22-f84a66c35bad', 'MATH 216', '16:20:00', '17:10:00', '{Monday,Wednesday,Friday}'),
    -- Semester 15
    ('22bb6257-452f-4c62-8e09-797833c7a354', 'b352a2ca-d65e-4a11-a7a4-7f2221a8297c', 'COSC 424', '16:45:00', '18:00:00', '{Tuesday,Thursday}'),
    ('32346dd5-7388-4f31-b67f-007cdf68a183', 'b352a2ca-d65e-4a11-a7a4-7f2221a8297c', 'COSC 345', '12:00:00', '13:15:00', '{Tuesday,Thursday}'),
    ('e21cd1cb-43ce-4921-91b5-044936694d18', 'b352a2ca-d65e-4a11-a7a4-7f2221a8297c', 'COSC 481', '21:30:00', '22:45:00', '{Tuesday,Thursday}'),
    ('93f1e835-14a5-4ae6-9b8a-a34272cda33b', 'b352a2ca-d65e-4a11-a7a4-7f2221a8297c', 'COSC 380', '19:50:00', '20:40:00', '{Monday,Wednesday}'),
    ('6d03d67c-c072-4eeb-a7aa-41f8f472635c', 'b352a2ca-d65e-4a11-a7a4-7f2221a8297c', 'COSC 319', '15:10:00', '16:25:00', '{Tuesday,Thursday}'),
    -- Semester 16
    ('d67ced43-1dd2-474f-b087-73489132b39c', '05f94ec7-c296-4d0c-bec7-2ab2293b4d0f', 'COSC 410', '13:35:00', '14:50:00', '{Tuesday,Thursday}'),
    ('ac42fd7b-13ab-4108-827c-4b638f60c428', '05f94ec7-c296-4d0c-bec7-2ab2293b4d0f', 'COSC 343', '16:20:00', '17:10:00', '{Monday,Wednesday,Friday}'),
    ('7803e615-a540-41b6-bc32-04c707b31fc1', '05f94ec7-c296-4d0c-bec7-2ab2293b4d0f', 'COSC 432', '16:45:00', '18:00:00', '{Tuesday,Thursday}'),
    ('333487ad-e66a-48a4-a929-277e199975db', '05f94ec7-c296-4d0c-bec7-2ab2293b4d0f', 'COSC 480', '19:50:00', '20:40:00', '{Wednesday}'),
    ('df2e5a95-6605-4953-93a1-896077e44660', '05f94ec7-c296-4d0c-bec7-2ab2293b4d0f', 'COSC 473', '17:30:00', '18:20:00', '{Monday,Wednesday,Friday}'),
    ('a59819c9-011a-4a69-ae39-4eb0dd808428', '05f94ec7-c296-4d0c-bec7-2ab2293b4d0f', 'COSC 365', '13:10:00', '14:00:00', '{Monday,Wednesday,Friday}');
