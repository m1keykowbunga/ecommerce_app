const mockAddresses = [
  {
    id: 'addr1',
    userId: 'u1',
    label: 'Casa',
    fullName: 'Jair García',
    streetAddress: 'Cra 47 #76D Sur - 37',
    city: 'Sabaneta',
    department: 'Antioquia',
    zipCode: '055450',
    phoneNumber: '3148702078',
    isDefault: true,
  },
];

let addresses = [...mockAddresses];
let nextId = addresses.length + 1;

export const addressServiceMock = {
  getUserAddresses: (userId) => {
    return addresses.filter((a) => a.userId === userId);
  },

  createAddress: (userId, addressData) => {
    if (addressData.isDefault) {
      addresses = addresses.map((a) =>
        a.userId === userId ? { ...a, isDefault: false } : a
      );
    }
    const newAddress = {
      id: `addr${nextId++}`,
      userId,
      ...addressData,
    };
    addresses = [...addresses, newAddress];
    return newAddress;
  },

  updateAddress: (addressId, addressData) => {
    if (addressData.isDefault) {
      const target = addresses.find((a) => a.id === addressId);
      if (target) {
        addresses = addresses.map((a) =>
          a.userId === target.userId && a.id !== addressId
            ? { ...a, isDefault: false }
            : a
        );
      }
    }
    addresses = addresses.map((a) =>
      a.id === addressId ? { ...a, ...addressData } : a
    );
    return addresses.find((a) => a.id === addressId);
  },

  deleteAddress: (addressId) => {
    addresses = addresses.filter((a) => a.id !== addressId);
  },
};
