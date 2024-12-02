<template>
  <div class="oa-dashboard">
    <div class="sidebar">
      <nav>
        <ul>
          <li><router-link to="/oa/workflow">工作流</router-link></li>
          <li><router-link to="/oa/documents">文档管理</router-link></li>
          <li><router-link to="/oa/attendance">考勤管理</router-link></li>
        </ul>
      </nav>
    </div>
    <div class="main-content">
      <router-view></router-view>
    </div>
  </div>
</template> 