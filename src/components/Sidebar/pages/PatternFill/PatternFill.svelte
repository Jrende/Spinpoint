<script>
  import { _ } from 'svelte-i18n'
  import { Tab, Tabs, TabContent } from '../../../Tabs';
  import HeddleThreadingFill from './HeddleThreadingFill.svelte';
  import ColorFill from './ColorFill.svelte';


</script>
<Tabs>
  <Tab tabId="warp/weft" open={true}>
    <span>{$_('page.pattern_fill.warp_weft_title')}</span>
  </Tab><Tab tabId="color">
    <span>{$_('page.pattern_fill.color_title')}</span>
  </Tab>
  <div slot="content">
    <TabContent tabId="warp/weft">
      <HeddleThreadingFill />
    </TabContent>
    <TabContent tabId="color">
      <ColorFill />
    </TabContent>
  </div>
</Tabs>
<style>
</style>
