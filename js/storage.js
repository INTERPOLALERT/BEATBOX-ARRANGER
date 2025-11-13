// storage.js - IndexedDB storage using localforage
const StorageManager = {
    store: null,

    init() {
        try {
            if (typeof localforage === 'undefined') {
                console.error('localforage not loaded!');
                return false;
            }

            this.store = localforage.createInstance({
                name: 'beatbox-arranger',
                storeName: 'sounds'
            });

            console.log('✓ Storage initialized');
            return true;
        } catch (error) {
            console.error('Storage init failed:', error);
            return false;
        }
    },

    async saveSound(id, soundData) {
        if (!this.store) return false;
        try {
            await this.store.setItem(id, soundData);
            return true;
        } catch (error) {
            console.error('Save sound failed:', error);
            return false;
        }
    },

    async getSound(id) {
        if (!this.store) return null;
        try {
            return await this.store.getItem(id);
        } catch (error) {
            console.error('Get sound failed:', error);
            return null;
        }
    },

    async getAllSounds() {
        if (!this.store) return [];
        try {
            const sounds = [];
            await this.store.iterate((value, key) => {
                sounds.push({ id: key, ...value });
            });
            return sounds;
        } catch (error) {
            console.error('Get all sounds failed:', error);
            return [];
        }
    },

    async deleteSound(id) {
        if (!this.store) return false;
        try {
            await this.store.removeItem(id);
            return true;
        } catch (error) {
            console.error('Delete sound failed:', error);
            return false;
        }
    }
};
