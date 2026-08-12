<script setup lang="ts">
import publishLog from '../../generated/publish-log.json'
</script>
<template><section class="note-section"><h2>发布日志</h2><p>以下记录来自仓库提交历史。</p><ol class="publish-log"><li v-for="entry in publishLog" :key="entry.hash"><time>{{ entry.date }}</time> {{ entry.summary }} <code>{{ entry.hash.slice(0, 7) }}</code></li></ol></section></template>
