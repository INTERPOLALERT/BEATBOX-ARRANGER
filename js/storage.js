/**
 * storage.js - IndexedDB management using localforage
 * Handles persistent storage of uploaded audio files
 */

const StorageManager = {
    // Initialize localforage instance
    store: null,

    /**
     * Initialize the storage system
     */
    init() {
        this.store = localforage.createInstance({
            name: 'beatbox-arranger',
            storeName: 'sounds',
            description: 'Beatbox sound library storage'
        });
        console.log('Storage initialized');
    },

    /**
     * Save a sound to IndexedDB
     * @param {string} id - Unique identifier for the sound
     * @param {Object} soundData - Sound data object
     * @returns {Promise}
     */
    async saveSound(id, soundData) {
        try {
            await this.store.setItem(id, soundData);
            console.log(`Sound saved: ${id}`);
            return true;
        } catch (error) {
            console.error('Error saving sound:', error);
            throw error;
        }
    },

    /**
     * Get a sound from IndexedDB
     * @param {string} id - Sound identifier
     * @returns {Promise<Object>}
     */
    async getSound(id) {
        try {
            const sound = await this.store.getItem(id);
            return sound;
        } catch (error) {
            console.error('Error getting sound:', error);
            throw error;
        }
    },

    /**
     * Get all sounds from IndexedDB
     * @returns {Promise<Array>}
     */
    async getAllSounds() {
        try {
            const sounds = [];
            await this.store.iterate((value, key) => {
                sounds.push({ id: key, ...value });
            });
            console.log(`Retrieved ${sounds.length} sounds from storage`);
            return sounds;
        } catch (error) {
            console.error('Error getting all sounds:', error);
            throw error;
        }
    },

    /**
     * Delete a sound from IndexedDB
     * @param {string} id - Sound identifier
     * @returns {Promise}
     */
    async deleteSound(id) {
        try {
            await this.store.removeItem(id);
            console.log(`Sound deleted: ${id}`);
            return true;
        } catch (error) {
            console.error('Error deleting sound:', error);
            throw error;
        }
    },

    /**
     * Clear all sounds from IndexedDB
     * @returns {Promise}
     */
    async clearAll() {
        try {
            await this.store.clear();
            console.log('All sounds cleared from storage');
            return true;
        } catch (error) {
            console.error('Error clearing storage:', error);
            throw error;
        }
    },

    /**
     * Get storage statistics
     * @returns {Promise<Object>}
     */
    async getStats() {
        try {
            const sounds = await this.getAllSounds();
            let totalSize = 0;

            sounds.forEach(sound => {
                if (sound.arrayBuffer) {
                    totalSize += sound.arrayBuffer.byteLength;
                }
            });

            return {
                count: sounds.length,
                totalSize: totalSize,
                totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2)
            };
        } catch (error) {
            console.error('Error getting stats:', error);
            return { count: 0, totalSize: 0, totalSizeMB: 0 };
        }
    }
};

// Auto-initialize on load
if (typeof localforage !== 'undefined') {
    StorageManager.init();
} else {
    console.error('localforage library not loaded!');
}
