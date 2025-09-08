package com.viitorul.app.repository;

import com.viitorul.app.entity.Ad;
import com.viitorul.app.entity.Ad.DeviceType;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AdRepository extends JpaRepository<Ad, Long> {

    // listări
    List<Ad> findByPositionAndDeviceTypeOrderByOrderIndexAsc(String position, DeviceType deviceType);

    @Query("""
      select a 
      from Ad a 
      where (:position is null or a.position = :position)
        and (:deviceType is null or a.deviceType = :deviceType)
      order by a.deviceType asc, a.position asc, a.orderIndex asc
    """)
    List<Ad> findAllSorted(@Param("position") String position,
                           @Param("deviceType") DeviceType deviceType);

    // max index în bucket (position+device)
    @Query("""
      select coalesce(max(a.orderIndex),0) 
      from Ad a 
      where a.position = :position and a.deviceType = :deviceType
    """)
    Integer maxOrderInBucket(@Param("position") String position,
                             @Param("deviceType") DeviceType deviceType);

    // când scoatem un element din bucket: închidem gaura (toate > oldIndex coboară cu 1)
    @Modifying
    @Query("""
      update Ad a 
      set a.orderIndex = a.orderIndex - 1
      where a.position = :position 
        and a.deviceType = :deviceType
        and a.orderIndex > :oldIndex
    """)
    int compactAfter(@Param("position") String position,
                     @Param("deviceType") DeviceType deviceType,
                     @Param("oldIndex") int oldIndex);

    // când inserăm într-un bucket la newIndex: facem loc (toate >= newIndex urcă cu 1)
    @Modifying
    @Query("""
      update Ad a 
      set a.orderIndex = a.orderIndex + 1
      where a.position = :position 
        and a.deviceType = :deviceType
        and a.orderIndex >= :newIndex
    """)
    int makeRoomFrom(@Param("position") String position,
                     @Param("deviceType") DeviceType deviceType,
                     @Param("newIndex") int newIndex);

    // mutare în același bucket: newIndex < oldIndex => [newIndex, oldIndex-1] urcă cu 1
    @Modifying
    @Query("""
      update Ad a 
      set a.orderIndex = a.orderIndex + 1
      where a.position = :position 
        and a.deviceType = :deviceType
        and a.orderIndex between :start and :end
        and a.id <> :id
    """)
    int bumpUpBetween(@Param("position") String position,
                      @Param("deviceType") DeviceType deviceType,
                      @Param("start") int start,
                      @Param("end") int end,
                      @Param("id") Long excludeId);

    // mutare în același bucket: newIndex > oldIndex => [oldIndex+1, newIndex] coboară cu 1
    @Modifying
    @Query("""
      update Ad a 
      set a.orderIndex = a.orderIndex - 1
      where a.position = :position 
        and a.deviceType = :deviceType
        and a.orderIndex between :start and :end
        and a.id <> :id
    """)
    int bumpDownBetween(@Param("position") String position,
                        @Param("deviceType") DeviceType deviceType,
                        @Param("start") int start,
                        @Param("end") int end,
                        @Param("id") Long excludeId);
}
